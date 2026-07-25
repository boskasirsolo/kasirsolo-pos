-- ============================================================================
-- KASIRSOLO - Migration 006: WhatsApp + PIN Auth System
-- Purpose: Migrate from email+password to WhatsApp+PIN auth for kasir apps
-- Admin dashboard retains email+password (Supabase Auth)
-- ============================================================================

-- ============================================================================
-- 1. ksp_clients: Make whatsapp the primary identifier
-- ============================================================================

-- Add pin_hash column for bcrypt-hashed 6-digit PIN
ALTER TABLE ksp_clients
  ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);

-- Make whatsapp NOT NULL (backfill empty values first if needed)
UPDATE ksp_clients SET whatsapp = phone WHERE whatsapp IS NULL AND phone IS NOT NULL;
UPDATE ksp_clients SET whatsapp = '' WHERE whatsapp IS NULL;

ALTER TABLE ksp_clients
  ALTER COLUMN whatsapp SET NOT NULL;

-- Add unique constraint on whatsapp
ALTER TABLE ksp_clients
  ADD CONSTRAINT uq_ksp_clients_whatsapp UNIQUE (whatsapp);

-- Make email nullable (was NOT NULL)
ALTER TABLE ksp_clients
  ALTER COLUMN email DROP NOT NULL;

-- Add index on whatsapp for fast lookups
CREATE INDEX IF NOT EXISTS idx_ksp_clients_whatsapp ON ksp_clients(whatsapp);

-- ============================================================================
-- 2. ksp_users: Switch from plaintext PIN to bcrypt hash, make email nullable
-- ============================================================================

-- Rename pin → pin_hash and change type
ALTER TABLE ksp_users
  RENAME COLUMN pin TO pin_hash;

ALTER TABLE ksp_users
  ALTER COLUMN pin_hash TYPE VARCHAR(255);

-- Make email nullable for kasir users (cashier/manager don't need email)
ALTER TABLE ksp_users
  ALTER COLUMN email DROP NOT NULL;

-- Add whatsapp column for user-level WA number
ALTER TABLE ksp_users
  ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20);

-- Drop the auth_user_id FK constraint (kasir users don't use Supabase Auth)
-- Keep the column but remove the NOT NULL / FK constraint
ALTER TABLE ksp_users
  DROP CONSTRAINT IF EXISTS ksp_users_auth_user_id_fkey;

-- Note: auth_user_id column is kept for backward compatibility but is
-- no longer required. Kasir apps authenticate via ksp_clients.whatsapp + pin_hash.

-- ============================================================================
-- 3. Add new log actions for WA+PIN auth
-- ============================================================================

DO $$ BEGIN
  ALTER TYPE ksp_log_action ADD VALUE IF NOT EXISTS 'auth.pin_reset';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE ksp_log_action ADD VALUE IF NOT EXISTS 'license.revoke';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- COMPLETED: Migration 006 - WhatsApp + PIN Auth System
-- Changes:
--   ksp_clients: +pin_hash, whatsapp NOT NULL + UNIQUE, email nullable
--   ksp_users: pin → pin_hash (VARCHAR 255), email nullable, +whatsapp
--   ksp_log_action: +auth.pin_reset, +license.revoke
-- ============================================================================
