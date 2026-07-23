-- ============================================================================
-- KASIRSOLO - Sharing/Referral System Migration
-- Developer: PT Mesin Kasir Solo
-- Owner: Amin Maghfuri (owner.kasirsolo@gmail.com)
-- Created: 2026-07-23
-- ============================================================================
-- Tracks share missions and individual shares for trial extension
-- and feature unlocking (e.g. database backup).
--
-- Business rules:
--   - Trial default: 14 days
--   - Share mission for trial extension: 10 shares -> +6 days
--   - Maximum 3 trial extension missions (total trial ~30 days)
--   - Backup unlock mission: 5 shares -> permanent unlock
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE ksp_share_mission_type AS ENUM ('trial_extension', 'backup_unlock');

CREATE TYPE ksp_share_mission_status AS ENUM ('active', 'completed', 'expired');

CREATE TYPE ksp_share_method AS ENUM ('web_share', 'copy_link', 'whatsapp', 'telegram', 'other');

-- ============================================================================
-- TABLE: ksp_share_missions
-- ============================================================================

CREATE TABLE ksp_share_missions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id        UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  client_id         UUID NOT NULL REFERENCES ksp_clients(id) ON DELETE CASCADE,
  mission_type      ksp_share_mission_type NOT NULL,
  mission_number    INTEGER NOT NULL DEFAULT 1,
  required_shares   INTEGER NOT NULL DEFAULT 10,
  completed_shares  INTEGER NOT NULL DEFAULT 0,
  status            ksp_share_mission_status NOT NULL DEFAULT 'active',
  reward_days       INTEGER NOT NULL DEFAULT 0,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Each license can only have one mission per type+number
  CONSTRAINT uq_ksp_share_missions_license_type_num
    UNIQUE (license_id, mission_type, mission_number),

  -- Trial extension missions are capped at 3
  CONSTRAINT chk_ksp_share_missions_max_trial
    CHECK (mission_type != 'trial_extension' OR mission_number <= 3),

  -- Backup unlock only has mission_number = 1
  CONSTRAINT chk_ksp_share_missions_backup_single
    CHECK (mission_type != 'backup_unlock' OR mission_number = 1),

  -- required_shares must be positive
  CONSTRAINT chk_ksp_share_missions_required
    CHECK (required_shares > 0),

  -- completed_shares cannot exceed required
  CONSTRAINT chk_ksp_share_missions_completed
    CHECK (completed_shares >= 0)
);

CREATE INDEX idx_ksp_share_missions_license ON ksp_share_missions(license_id);
CREATE INDEX idx_ksp_share_missions_client ON ksp_share_missions(client_id);
CREATE INDEX idx_ksp_share_missions_status ON ksp_share_missions(status);
CREATE INDEX idx_ksp_share_missions_type ON ksp_share_missions(mission_type);

CREATE TRIGGER trg_ksp_share_missions_updated_at
  BEFORE UPDATE ON ksp_share_missions
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_share_logs
-- ============================================================================

CREATE TABLE ksp_share_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id      UUID NOT NULL REFERENCES ksp_share_missions(id) ON DELETE CASCADE,
  license_id      UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES ksp_clients(id) ON DELETE CASCADE,
  share_method    ksp_share_method NOT NULL DEFAULT 'web_share',
  share_target    VARCHAR(255),  -- hashed contact identifier for dedup
  shared_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified        BOOLEAN NOT NULL DEFAULT false,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ksp_share_logs_mission ON ksp_share_logs(mission_id);
CREATE INDEX idx_ksp_share_logs_license ON ksp_share_logs(license_id);
CREATE INDEX idx_ksp_share_logs_client ON ksp_share_logs(client_id);
CREATE INDEX idx_ksp_share_logs_shared_at ON ksp_share_logs(shared_at DESC);

-- No updated_at trigger for logs (immutable after creation)

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ksp_share_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_share_logs ENABLE ROW LEVEL SECURITY;

-- ksp_share_missions: Client can read/create/update their own
CREATE POLICY "ksp_share_missions_client_read"
  ON ksp_share_missions FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "ksp_share_missions_client_insert"
  ON ksp_share_missions FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "ksp_share_missions_client_update"
  ON ksp_share_missions FOR UPDATE
  USING (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

-- ksp_share_logs: Client can read/create their own
CREATE POLICY "ksp_share_logs_client_read"
  ON ksp_share_logs FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "ksp_share_logs_client_insert"
  ON ksp_share_logs FOR INSERT
  WITH CHECK (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTION: Auto-complete missions when share count reaches required_shares
-- ============================================================================

CREATE OR REPLACE FUNCTION ksp_on_share_log_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_mission RECORD;
  v_share_count INTEGER;
BEGIN
  -- Count total shares for this mission
  SELECT COUNT(*) INTO v_share_count
  FROM ksp_share_logs
  WHERE mission_id = NEW.mission_id;

  -- Fetch the mission record
  SELECT * INTO v_mission
  FROM ksp_share_missions
  WHERE id = NEW.mission_id;

  -- Update completed_shares on the mission
  UPDATE ksp_share_missions
  SET
    completed_shares = v_share_count,
    status = CASE
      WHEN v_share_count >= v_mission.required_shares THEN 'completed'::ksp_share_mission_status
      ELSE status
    END,
    completed_at = CASE
      WHEN v_share_count >= v_mission.required_shares AND completed_at IS NULL THEN NOW()
      ELSE completed_at
    END,
    reward_days = CASE
      WHEN v_share_count >= v_mission.required_shares AND v_mission.mission_type = 'trial_extension' THEN 6
      ELSE reward_days
    END
  WHERE id = NEW.mission_id;

  -- If just completed a trial_extension mission, extend the license trial
  IF v_share_count >= v_mission.required_shares
     AND v_mission.mission_type = 'trial_extension'
     AND v_mission.status != 'completed' THEN
    UPDATE ksp_licenses
    SET
      trial_ends_at = COALESCE(trial_ends_at, NOW()) + INTERVAL '6 days',
      expires_at = COALESCE(expires_at, NOW()) + INTERVAL '6 days'
    WHERE id = NEW.license_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_ksp_share_logs_after_insert
  AFTER INSERT ON ksp_share_logs
  FOR EACH ROW EXECUTE FUNCTION ksp_on_share_log_insert();

-- ============================================================================
-- COMPLETED: Sharing/Referral System
-- Tables: 2 (ksp_share_missions, ksp_share_logs)
-- ENUMs: 3 (ksp_share_mission_type, ksp_share_mission_status, ksp_share_method)
-- Functions: 1 (ksp_on_share_log_insert)
-- Triggers: 2 (trg_ksp_share_missions_updated_at, trg_ksp_share_logs_after_insert)
-- ============================================================================
