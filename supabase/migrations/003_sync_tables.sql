-- ============================================================================
-- KASIRSOLO - Sync Tables Migration
-- Purpose: Cloud-side tables for bidirectional POS data synchronization.
--          These mirror the local IndexedDB stores, scoped by license_id.
-- Created: 2026-07-22
-- ============================================================================

-- ============================================================================
-- ENUM: ksp_sync_direction
-- ============================================================================

CREATE TYPE ksp_sync_direction AS ENUM ('push', 'pull', 'full');

CREATE TYPE ksp_sync_log_status AS ENUM ('started', 'completed', 'failed', 'partial');

-- ============================================================================
-- TABLE: ksp_synced_categories
-- ============================================================================

CREATE TABLE ksp_synced_categories (
  id              UUID PRIMARY KEY,
  license_id      UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  color           VARCHAR(20) NOT NULL DEFAULT '#6B7280',
  icon            VARCHAR(50),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_ksp_synced_categories_license ON ksp_synced_categories(license_id);
CREATE INDEX idx_ksp_synced_categories_license_updated ON ksp_synced_categories(license_id, updated_at);

CREATE TRIGGER trg_ksp_synced_categories_updated_at
  BEFORE UPDATE ON ksp_synced_categories
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_synced_products
-- ============================================================================

CREATE TABLE ksp_synced_products (
  id              UUID PRIMARY KEY,
  license_id      UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  barcode         VARCHAR(100),
  name            VARCHAR(300) NOT NULL,
  category_id     UUID REFERENCES ksp_synced_categories(id) ON DELETE SET NULL,
  price           BIGINT NOT NULL DEFAULT 0,
  cost_price      BIGINT NOT NULL DEFAULT 0,
  stock           BIGINT NOT NULL DEFAULT 0,
  min_stock       INTEGER NOT NULL DEFAULT 0,
  unit            VARCHAR(50) NOT NULL DEFAULT 'pcs',
  image           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  track_stock     BOOLEAN NOT NULL DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_ksp_synced_products_license ON ksp_synced_products(license_id);
CREATE INDEX idx_ksp_synced_products_license_updated ON ksp_synced_products(license_id, updated_at);
CREATE INDEX idx_ksp_synced_products_barcode ON ksp_synced_products(license_id, barcode);
CREATE INDEX idx_ksp_synced_products_category ON ksp_synced_products(license_id, category_id);

CREATE TRIGGER trg_ksp_synced_products_updated_at
  BEFORE UPDATE ON ksp_synced_products
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_synced_transactions
-- ============================================================================

CREATE TABLE ksp_synced_transactions (
  id                  UUID PRIMARY KEY,
  license_id          UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  transaction_number  VARCHAR(100) NOT NULL,
  items               JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal            BIGINT NOT NULL DEFAULT 0,
  discount_amount     BIGINT NOT NULL DEFAULT 0,
  discount_type       VARCHAR(20),
  discount_value      BIGINT NOT NULL DEFAULT 0,
  tax_amount          BIGINT NOT NULL DEFAULT 0,
  tax_percentage      NUMERIC(5,2) NOT NULL DEFAULT 0,
  total               BIGINT NOT NULL DEFAULT 0,
  amount_paid         BIGINT NOT NULL DEFAULT 0,
  change              BIGINT NOT NULL DEFAULT 0,
  payment_method      VARCHAR(50) NOT NULL DEFAULT 'cash',
  payment_ref         VARCHAR(255),
  cashier_id          UUID,
  cashier_name        VARCHAR(200),
  customer_name       VARCHAR(200),
  customer_phone      VARCHAR(50),
  notes               TEXT,
  is_void             BOOLEAN NOT NULL DEFAULT false,
  void_reason         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_ksp_synced_transactions_license ON ksp_synced_transactions(license_id);
CREATE INDEX idx_ksp_synced_transactions_license_updated ON ksp_synced_transactions(license_id, updated_at);
CREATE INDEX idx_ksp_synced_transactions_number ON ksp_synced_transactions(license_id, transaction_number);
CREATE INDEX idx_ksp_synced_transactions_date ON ksp_synced_transactions(license_id, created_at);

CREATE TRIGGER trg_ksp_synced_transactions_updated_at
  BEFORE UPDATE ON ksp_synced_transactions
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_synced_stock_adjustments
-- ============================================================================

CREATE TABLE ksp_synced_stock_adjustments (
  id              UUID PRIMARY KEY,
  license_id      UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL,
  product_name    VARCHAR(300) NOT NULL,
  type            VARCHAR(50) NOT NULL,
  quantity        BIGINT NOT NULL DEFAULT 0,
  stock_before    BIGINT NOT NULL DEFAULT 0,
  stock_after     BIGINT NOT NULL DEFAULT 0,
  reason          TEXT NOT NULL DEFAULT '',
  adjusted_by     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_ksp_synced_stock_adj_license ON ksp_synced_stock_adjustments(license_id);
CREATE INDEX idx_ksp_synced_stock_adj_license_updated ON ksp_synced_stock_adjustments(license_id, updated_at);
CREATE INDEX idx_ksp_synced_stock_adj_product ON ksp_synced_stock_adjustments(license_id, product_id);

CREATE TRIGGER trg_ksp_synced_stock_adj_updated_at
  BEFORE UPDATE ON ksp_synced_stock_adjustments
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_synced_receipts
-- ============================================================================

CREATE TABLE ksp_synced_receipts (
  id                  UUID PRIMARY KEY,
  license_id          UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  transaction_number  VARCHAR(100) NOT NULL,
  store_name          VARCHAR(300) NOT NULL,
  store_address       TEXT,
  store_phone         VARCHAR(50),
  items               JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal            BIGINT NOT NULL DEFAULT 0,
  discount_label      VARCHAR(200),
  discount_amount     BIGINT NOT NULL DEFAULT 0,
  tax_label           VARCHAR(100),
  tax_amount          BIGINT NOT NULL DEFAULT 0,
  total               BIGINT NOT NULL DEFAULT 0,
  amount_paid         BIGINT NOT NULL DEFAULT 0,
  change              BIGINT NOT NULL DEFAULT 0,
  payment_method      VARCHAR(50) NOT NULL DEFAULT 'cash',
  cashier_name        VARCHAR(200),
  customer_name       VARCHAR(200),
  footer_message      TEXT,
  format              VARCHAR(50) NOT NULL DEFAULT 'thermal_58mm',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_ksp_synced_receipts_license ON ksp_synced_receipts(license_id);
CREATE INDEX idx_ksp_synced_receipts_license_updated ON ksp_synced_receipts(license_id, updated_at);

CREATE TRIGGER trg_ksp_synced_receipts_updated_at
  BEFORE UPDATE ON ksp_synced_receipts
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_synced_daily_reports
-- ============================================================================

CREATE TABLE ksp_synced_daily_reports (
  id                    UUID PRIMARY KEY,
  license_id            UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  total_transactions    INTEGER NOT NULL DEFAULT 0,
  void_transactions     INTEGER NOT NULL DEFAULT 0,
  gross_revenue         BIGINT NOT NULL DEFAULT 0,
  total_discounts       BIGINT NOT NULL DEFAULT 0,
  total_tax             BIGINT NOT NULL DEFAULT 0,
  net_revenue           BIGINT NOT NULL DEFAULT 0,
  payment_breakdown     JSONB NOT NULL DEFAULT '[]'::jsonb,
  top_products          JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_items_sold      INTEGER NOT NULL DEFAULT 0,
  average_transaction   BIGINT NOT NULL DEFAULT 0,
  opening_cash          BIGINT NOT NULL DEFAULT 0,
  closing_cash          BIGINT NOT NULL DEFAULT 0,
  cash_difference       BIGINT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ,

  CONSTRAINT uq_ksp_synced_daily_reports_license_date UNIQUE (license_id, date)
);

CREATE INDEX idx_ksp_synced_daily_reports_license ON ksp_synced_daily_reports(license_id);
CREATE INDEX idx_ksp_synced_daily_reports_license_updated ON ksp_synced_daily_reports(license_id, updated_at);
CREATE INDEX idx_ksp_synced_daily_reports_date ON ksp_synced_daily_reports(license_id, date);

CREATE TRIGGER trg_ksp_synced_daily_reports_updated_at
  BEFORE UPDATE ON ksp_synced_daily_reports
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_sync_log
-- ============================================================================

CREATE TABLE ksp_sync_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id      UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  device_id       UUID REFERENCES ksp_devices(id) ON DELETE SET NULL,
  direction       ksp_sync_direction NOT NULL,
  records_pushed  INTEGER NOT NULL DEFAULT 0,
  records_pulled  INTEGER NOT NULL DEFAULT 0,
  conflicts       INTEGER NOT NULL DEFAULT 0,
  error_message   TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  status          ksp_sync_log_status NOT NULL DEFAULT 'started'
);

CREATE INDEX idx_ksp_sync_log_license ON ksp_sync_log(license_id);
CREATE INDEX idx_ksp_sync_log_device ON ksp_sync_log(device_id);
CREATE INDEX idx_ksp_sync_log_started ON ksp_sync_log(license_id, started_at DESC);
CREATE INDEX idx_ksp_sync_log_status ON ksp_sync_log(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE ksp_synced_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_synced_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_synced_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_synced_stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_synced_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_synced_daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_sync_log ENABLE ROW LEVEL SECURITY;

-- Helper function: check if the current user owns the license
CREATE OR REPLACE FUNCTION ksp_user_owns_license(p_license_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ksp_licenses l
    JOIN ksp_clients c ON c.id = l.client_id
    WHERE l.id = p_license_id
      AND c.auth_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ---- ksp_synced_products ----
CREATE POLICY "synced_products_select"
  ON ksp_synced_products FOR SELECT
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_products_insert"
  ON ksp_synced_products FOR INSERT
  WITH CHECK (ksp_user_owns_license(license_id));

CREATE POLICY "synced_products_update"
  ON ksp_synced_products FOR UPDATE
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_products_delete"
  ON ksp_synced_products FOR DELETE
  USING (ksp_user_owns_license(license_id));

-- ---- ksp_synced_transactions ----
CREATE POLICY "synced_transactions_select"
  ON ksp_synced_transactions FOR SELECT
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_transactions_insert"
  ON ksp_synced_transactions FOR INSERT
  WITH CHECK (ksp_user_owns_license(license_id));

CREATE POLICY "synced_transactions_update"
  ON ksp_synced_transactions FOR UPDATE
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_transactions_delete"
  ON ksp_synced_transactions FOR DELETE
  USING (ksp_user_owns_license(license_id));

-- ---- ksp_synced_categories ----
CREATE POLICY "synced_categories_select"
  ON ksp_synced_categories FOR SELECT
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_categories_insert"
  ON ksp_synced_categories FOR INSERT
  WITH CHECK (ksp_user_owns_license(license_id));

CREATE POLICY "synced_categories_update"
  ON ksp_synced_categories FOR UPDATE
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_categories_delete"
  ON ksp_synced_categories FOR DELETE
  USING (ksp_user_owns_license(license_id));

-- ---- ksp_synced_stock_adjustments ----
CREATE POLICY "synced_stock_adj_select"
  ON ksp_synced_stock_adjustments FOR SELECT
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_stock_adj_insert"
  ON ksp_synced_stock_adjustments FOR INSERT
  WITH CHECK (ksp_user_owns_license(license_id));

CREATE POLICY "synced_stock_adj_update"
  ON ksp_synced_stock_adjustments FOR UPDATE
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_stock_adj_delete"
  ON ksp_synced_stock_adjustments FOR DELETE
  USING (ksp_user_owns_license(license_id));

-- ---- ksp_synced_receipts ----
CREATE POLICY "synced_receipts_select"
  ON ksp_synced_receipts FOR SELECT
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_receipts_insert"
  ON ksp_synced_receipts FOR INSERT
  WITH CHECK (ksp_user_owns_license(license_id));

CREATE POLICY "synced_receipts_update"
  ON ksp_synced_receipts FOR UPDATE
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_receipts_delete"
  ON ksp_synced_receipts FOR DELETE
  USING (ksp_user_owns_license(license_id));

-- ---- ksp_synced_daily_reports ----
CREATE POLICY "synced_daily_reports_select"
  ON ksp_synced_daily_reports FOR SELECT
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_daily_reports_insert"
  ON ksp_synced_daily_reports FOR INSERT
  WITH CHECK (ksp_user_owns_license(license_id));

CREATE POLICY "synced_daily_reports_update"
  ON ksp_synced_daily_reports FOR UPDATE
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "synced_daily_reports_delete"
  ON ksp_synced_daily_reports FOR DELETE
  USING (ksp_user_owns_license(license_id));

-- ---- ksp_sync_log ----
CREATE POLICY "sync_log_select"
  ON ksp_sync_log FOR SELECT
  USING (ksp_user_owns_license(license_id));

CREATE POLICY "sync_log_insert"
  ON ksp_sync_log FOR INSERT
  WITH CHECK (ksp_user_owns_license(license_id));

CREATE POLICY "sync_log_update"
  ON ksp_sync_log FOR UPDATE
  USING (ksp_user_owns_license(license_id));

-- ============================================================================
-- Enable Realtime for synced tables
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE ksp_synced_products;
ALTER PUBLICATION supabase_realtime ADD TABLE ksp_synced_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE ksp_synced_categories;
ALTER PUBLICATION supabase_realtime ADD TABLE ksp_synced_stock_adjustments;
ALTER PUBLICATION supabase_realtime ADD TABLE ksp_synced_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE ksp_synced_daily_reports;

-- ============================================================================
-- COMPLETED: Sync tables for KASIRSOLO
-- Tables: 7 (ksp_synced_products, ksp_synced_transactions,
--             ksp_synced_categories, ksp_synced_stock_adjustments,
--             ksp_synced_receipts, ksp_synced_daily_reports, ksp_sync_log)
-- ENUMs: 2 (ksp_sync_direction, ksp_sync_log_status)
-- Functions: 1 (ksp_user_owns_license)
-- ============================================================================
