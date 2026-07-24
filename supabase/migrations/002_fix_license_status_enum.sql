-- ============================================================================
-- KASIRSOLO - Migration 002
-- Fix: Add missing values to ksp_license_status enum
-- Added: 'revoked', 'pending'
-- Reason: revokeLicense() and other code reference these statuses but they
--         were not in the original enum definition. This causes SQL errors
--         at runtime when trying to INSERT or UPDATE with these values.
-- Backward compatible: ADD VALUE IF NOT EXISTS does not break existing data.
-- ============================================================================

-- Add missing enum values (safe: ignores if already present)
DO $$ BEGIN
    ALTER TYPE ksp_license_status ADD VALUE IF NOT EXISTS 'revoked';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TYPE ksp_license_status ADD VALUE IF NOT EXISTS 'pending';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
