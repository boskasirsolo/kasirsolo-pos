-- ============================================================================
-- KASIRSOLO - Initial Schema Migration
-- Developer: PT Mesin Kasir Solo
-- Owner: Amin Maghfuri (owner.kasirsolo@gmail.com)
-- Supabase Project: eoowqtsvaayijmjmgmid
-- Created: 2026-07-22
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE ksp_app_category AS ENUM ('bisnis', 'institusi', 'kesehatan');

CREATE TYPE ksp_plan_type AS ENUM ('offline', 'cloud_monthly', 'cloud_yearly');

CREATE TYPE ksp_license_status AS ENUM ('trial', 'active', 'expired', 'suspended');

CREATE TYPE ksp_user_role AS ENUM ('owner', 'manager', 'cashier');

CREATE TYPE ksp_transaction_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TYPE ksp_subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'expired');

CREATE TYPE ksp_log_action AS ENUM (
  'auth.login',
  'auth.logout',
  'auth.register',
  'license.activate',
  'license.expire',
  'license.suspend',
  'license.upgrade',
  'device.bind',
  'device.unbind',
  'subscription.create',
  'subscription.renew',
  'subscription.cancel',
  'transaction.create',
  'transaction.refund',
  'site.create',
  'site.update',
  'site.publish',
  'settings.update',
  'user.create',
  'user.update',
  'user.delete'
);

CREATE TYPE ksp_site_template AS ENUM (
  'minimal',
  'business',
  'portfolio',
  'landing'
);

-- ============================================================================
-- FUNCTIONS: updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION ksp_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE: ksp_apps (Product Catalog)
-- ============================================================================

CREATE TABLE ksp_apps (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(50) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  icon          VARCHAR(10),
  category      ksp_app_category NOT NULL,
  price         INTEGER NOT NULL DEFAULT 0,
  features      JSONB DEFAULT '[]'::jsonb,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ksp_apps_slug ON ksp_apps(slug);
CREATE INDEX idx_ksp_apps_category ON ksp_apps(category);
CREATE INDEX idx_ksp_apps_is_active ON ksp_apps(is_active);

CREATE TRIGGER trg_ksp_apps_updated_at
  BEFORE UPDATE ON ksp_apps
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_clients (Customer / Business)
-- ============================================================================

CREATE TABLE ksp_clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name            VARCHAR(200) NOT NULL,
  business_name   VARCHAR(200),
  email           VARCHAR(255) NOT NULL UNIQUE,
  phone           VARCHAR(20),
  whatsapp        VARCHAR(20),
  address         TEXT,
  city            VARCHAR(100),
  province        VARCHAR(100),
  postal_code     VARCHAR(10),
  metadata        JSONB DEFAULT '{}'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ksp_clients_auth_user_id ON ksp_clients(auth_user_id);
CREATE INDEX idx_ksp_clients_email ON ksp_clients(email);
CREATE INDEX idx_ksp_clients_phone ON ksp_clients(phone);
CREATE INDEX idx_ksp_clients_is_active ON ksp_clients(is_active);

CREATE TRIGGER trg_ksp_clients_updated_at
  BEFORE UPDATE ON ksp_clients
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_licenses (License Management)
-- ============================================================================

CREATE TABLE ksp_licenses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES ksp_clients(id) ON DELETE CASCADE,
  app_id          UUID NOT NULL REFERENCES ksp_apps(id) ON DELETE RESTRICT,
  license_key     VARCHAR(100) NOT NULL UNIQUE,
  plan_type       ksp_plan_type NOT NULL DEFAULT 'offline',
  status          ksp_license_status NOT NULL DEFAULT 'trial',
  max_devices     INTEGER NOT NULL DEFAULT 2,
  trial_ends_at   TIMESTAMPTZ,
  activated_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Max devices must be between 1 and 10
  CONSTRAINT chk_ksp_licenses_max_devices CHECK (max_devices >= 1 AND max_devices <= 10)
);

CREATE INDEX idx_ksp_licenses_client_id ON ksp_licenses(client_id);
CREATE INDEX idx_ksp_licenses_app_id ON ksp_licenses(app_id);
CREATE INDEX idx_ksp_licenses_license_key ON ksp_licenses(license_key);
CREATE INDEX idx_ksp_licenses_status ON ksp_licenses(status);
CREATE INDEX idx_ksp_licenses_plan_type ON ksp_licenses(plan_type);
CREATE INDEX idx_ksp_licenses_expires_at ON ksp_licenses(expires_at);

CREATE TRIGGER trg_ksp_licenses_updated_at
  BEFORE UPDATE ON ksp_licenses
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_devices (Device Binding)
-- ============================================================================

CREATE TABLE ksp_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id      UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  fingerprint     VARCHAR(255) NOT NULL,
  device_name     VARCHAR(200),
  device_number   INTEGER NOT NULL,
  user_agent      TEXT,
  ip_address      INET,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Device number must be 1 or 2 (default max_devices is 2)
  CONSTRAINT chk_ksp_devices_device_number CHECK (device_number >= 1 AND device_number <= 10),

  -- One fingerprint per license
  CONSTRAINT uq_ksp_devices_license_fingerprint UNIQUE (license_id, fingerprint),

  -- One device_number per license
  CONSTRAINT uq_ksp_devices_license_number UNIQUE (license_id, device_number)
);

CREATE INDEX idx_ksp_devices_license_id ON ksp_devices(license_id);
CREATE INDEX idx_ksp_devices_fingerprint ON ksp_devices(fingerprint);
CREATE INDEX idx_ksp_devices_is_active ON ksp_devices(is_active);

CREATE TRIGGER trg_ksp_devices_updated_at
  BEFORE UPDATE ON ksp_devices
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- FUNCTION: Enforce max active devices per license
-- ============================================================================

CREATE OR REPLACE FUNCTION ksp_check_max_devices()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Only check on INSERT or when activating a device
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.is_active = true AND OLD.is_active = false) THEN
    -- Get max_devices from license
    SELECT max_devices INTO max_allowed
    FROM ksp_licenses
    WHERE id = NEW.license_id;

    -- Count current active devices for this license (excluding the current one on UPDATE)
    SELECT COUNT(*) INTO current_count
    FROM ksp_devices
    WHERE license_id = NEW.license_id
      AND is_active = true
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF current_count >= max_allowed THEN
      RAISE EXCEPTION 'Maximum active devices (%) reached for this license', max_allowed;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ksp_devices_check_max
  BEFORE INSERT OR UPDATE ON ksp_devices
  FOR EACH ROW EXECUTE FUNCTION ksp_check_max_devices();

-- ============================================================================
-- TABLE: ksp_users (App Users with Roles)
-- ============================================================================

CREATE TABLE ksp_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  license_id      UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES ksp_clients(id) ON DELETE CASCADE,
  name            VARCHAR(200) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(20),
  role            ksp_user_role NOT NULL DEFAULT 'cashier',
  pin             VARCHAR(6),
  avatar_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ksp_users_auth_user_id ON ksp_users(auth_user_id);
CREATE INDEX idx_ksp_users_license_id ON ksp_users(license_id);
CREATE INDEX idx_ksp_users_client_id ON ksp_users(client_id);
CREATE INDEX idx_ksp_users_role ON ksp_users(role);
CREATE INDEX idx_ksp_users_is_active ON ksp_users(is_active);

CREATE TRIGGER trg_ksp_users_updated_at
  BEFORE UPDATE ON ksp_users
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_transactions (Payment Records)
-- ============================================================================

CREATE TABLE ksp_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES ksp_clients(id) ON DELETE CASCADE,
  license_id        UUID REFERENCES ksp_licenses(id) ON DELETE SET NULL,
  subscription_id   UUID,  -- FK added after ksp_subscriptions table
  invoice_number    VARCHAR(50) NOT NULL UNIQUE,
  amount            BIGINT NOT NULL DEFAULT 0,
  discount          BIGINT NOT NULL DEFAULT 0,
  tax               BIGINT NOT NULL DEFAULT 0,
  total             BIGINT NOT NULL DEFAULT 0,
  currency          VARCHAR(3) NOT NULL DEFAULT 'IDR',
  payment_method    VARCHAR(50),
  payment_reference VARCHAR(255),
  status            ksp_transaction_status NOT NULL DEFAULT 'pending',
  description       TEXT,
  paid_at           TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_ksp_transactions_amount CHECK (amount >= 0),
  CONSTRAINT chk_ksp_transactions_total CHECK (total >= 0)
);

CREATE INDEX idx_ksp_transactions_client_id ON ksp_transactions(client_id);
CREATE INDEX idx_ksp_transactions_license_id ON ksp_transactions(license_id);
CREATE INDEX idx_ksp_transactions_invoice_number ON ksp_transactions(invoice_number);
CREATE INDEX idx_ksp_transactions_status ON ksp_transactions(status);
CREATE INDEX idx_ksp_transactions_created_at ON ksp_transactions(created_at);

CREATE TRIGGER trg_ksp_transactions_updated_at
  BEFORE UPDATE ON ksp_transactions
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_subscriptions (Recurring Billing)
-- ============================================================================

CREATE TABLE ksp_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES ksp_clients(id) ON DELETE CASCADE,
  license_id        UUID NOT NULL REFERENCES ksp_licenses(id) ON DELETE CASCADE,
  plan_type         ksp_plan_type NOT NULL,
  status            ksp_subscription_status NOT NULL DEFAULT 'active',
  amount            BIGINT NOT NULL DEFAULT 0,
  currency          VARCHAR(3) NOT NULL DEFAULT 'IDR',
  billing_cycle_day INTEGER NOT NULL DEFAULT 1,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end   TIMESTAMPTZ NOT NULL,
  next_billing_at      TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  metadata          JSONB DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_ksp_subscriptions_amount CHECK (amount >= 0),
  CONSTRAINT chk_ksp_subscriptions_billing_day CHECK (billing_cycle_day >= 1 AND billing_cycle_day <= 28),
  CONSTRAINT chk_ksp_subscriptions_plan CHECK (plan_type IN ('cloud_monthly', 'cloud_yearly'))
);

CREATE INDEX idx_ksp_subscriptions_client_id ON ksp_subscriptions(client_id);
CREATE INDEX idx_ksp_subscriptions_license_id ON ksp_subscriptions(license_id);
CREATE INDEX idx_ksp_subscriptions_status ON ksp_subscriptions(status);
CREATE INDEX idx_ksp_subscriptions_next_billing ON ksp_subscriptions(next_billing_at);

CREATE TRIGGER trg_ksp_subscriptions_updated_at
  BEFORE UPDATE ON ksp_subscriptions
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- Add FK from ksp_transactions to ksp_subscriptions
ALTER TABLE ksp_transactions
  ADD CONSTRAINT fk_ksp_transactions_subscription
  FOREIGN KEY (subscription_id) REFERENCES ksp_subscriptions(id) ON DELETE SET NULL;

CREATE INDEX idx_ksp_transactions_subscription_id ON ksp_transactions(subscription_id);

-- ============================================================================
-- TABLE: ksp_sites (Portfolio Sites)
-- ============================================================================

CREATE TABLE ksp_sites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES ksp_clients(id) ON DELETE CASCADE,
  license_id      UUID REFERENCES ksp_licenses(id) ON DELETE SET NULL,
  slug            VARCHAR(100) NOT NULL UNIQUE,
  custom_domain   VARCHAR(255) UNIQUE,
  site_name       VARCHAR(200) NOT NULL,
  tagline         VARCHAR(500),
  template        ksp_site_template NOT NULL DEFAULT 'minimal',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  published_at    TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Slug format: lowercase, alphanumeric, hyphens only
  CONSTRAINT chk_ksp_sites_slug CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$')
);

CREATE INDEX idx_ksp_sites_client_id ON ksp_sites(client_id);
CREATE INDEX idx_ksp_sites_slug ON ksp_sites(slug);
CREATE INDEX idx_ksp_sites_custom_domain ON ksp_sites(custom_domain);
CREATE INDEX idx_ksp_sites_is_active ON ksp_sites(is_active);
CREATE INDEX idx_ksp_sites_is_published ON ksp_sites(is_published);

CREATE TRIGGER trg_ksp_sites_updated_at
  BEFORE UPDATE ON ksp_sites
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_site_pages (CMS Pages for Portfolio)
-- ============================================================================

CREATE TABLE ksp_site_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID NOT NULL REFERENCES ksp_sites(id) ON DELETE CASCADE,
  slug            VARCHAR(100) NOT NULL,
  title           VARCHAR(200) NOT NULL,
  content         JSONB DEFAULT '{}'::jsonb,
  page_type       VARCHAR(50) NOT NULL DEFAULT 'page',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  published_at    TIMESTAMPTZ,
  seo_title       VARCHAR(200),
  seo_description VARCHAR(500),
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique slug per site
  CONSTRAINT uq_ksp_site_pages_site_slug UNIQUE (site_id, slug)
);

CREATE INDEX idx_ksp_site_pages_site_id ON ksp_site_pages(site_id);
CREATE INDEX idx_ksp_site_pages_slug ON ksp_site_pages(slug);
CREATE INDEX idx_ksp_site_pages_page_type ON ksp_site_pages(page_type);
CREATE INDEX idx_ksp_site_pages_is_published ON ksp_site_pages(is_published);

CREATE TRIGGER trg_ksp_site_pages_updated_at
  BEFORE UPDATE ON ksp_site_pages
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_site_settings (Theme & Branding for Portfolio)
-- ============================================================================

CREATE TABLE ksp_site_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID NOT NULL REFERENCES ksp_sites(id) ON DELETE CASCADE UNIQUE,
  logo_url        TEXT,
  favicon_url     TEXT,
  primary_color   VARCHAR(7) DEFAULT '#FF5F1F',
  secondary_color VARCHAR(7) DEFAULT '#F7A237',
  accent_color    VARCHAR(7) DEFAULT '#FFCE55',
  font_heading    VARCHAR(100) DEFAULT 'Inter',
  font_body       VARCHAR(100) DEFAULT 'Inter',
  social_links    JSONB DEFAULT '{}'::jsonb,
  contact_info    JSONB DEFAULT '{}'::jsonb,
  analytics_id    VARCHAR(50),
  custom_css      TEXT,
  custom_head     TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ksp_site_settings_site_id ON ksp_site_settings(site_id);

CREATE TRIGGER trg_ksp_site_settings_updated_at
  BEFORE UPDATE ON ksp_site_settings
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- TABLE: ksp_logs (Audit Trail)
-- ============================================================================

CREATE TABLE ksp_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES ksp_clients(id) ON DELETE SET NULL,
  user_id         UUID REFERENCES ksp_users(id) ON DELETE SET NULL,
  license_id      UUID REFERENCES ksp_licenses(id) ON DELETE SET NULL,
  action          ksp_log_action NOT NULL,
  entity_type     VARCHAR(50),
  entity_id       UUID,
  description     TEXT,
  ip_address      INET,
  user_agent      TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ksp_logs_client_id ON ksp_logs(client_id);
CREATE INDEX idx_ksp_logs_user_id ON ksp_logs(user_id);
CREATE INDEX idx_ksp_logs_license_id ON ksp_logs(license_id);
CREATE INDEX idx_ksp_logs_action ON ksp_logs(action);
CREATE INDEX idx_ksp_logs_entity ON ksp_logs(entity_type, entity_id);
CREATE INDEX idx_ksp_logs_created_at ON ksp_logs(created_at DESC);

-- No updated_at trigger for logs (immutable)

-- ============================================================================
-- TABLE: ksp_settings (Global Settings)
-- ============================================================================

CREATE TABLE ksp_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             VARCHAR(100) NOT NULL UNIQUE,
  value           JSONB NOT NULL DEFAULT '{}'::jsonb,
  description     TEXT,
  is_public       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ksp_settings_key ON ksp_settings(key);
CREATE INDEX idx_ksp_settings_is_public ON ksp_settings(is_public);

CREATE TRIGGER trg_ksp_settings_updated_at
  BEFORE UPDATE ON ksp_settings
  FOR EACH ROW EXECUTE FUNCTION ksp_set_updated_at();

-- ============================================================================
-- HELPER FUNCTION: Generate license key
-- ============================================================================

CREATE OR REPLACE FUNCTION ksp_generate_license_key(app_slug VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  prefix VARCHAR;
  random_part VARCHAR;
BEGIN
  prefix := UPPER(LEFT(app_slug, 3));
  random_part := UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 16));
  RETURN prefix || '-' ||
         SUBSTRING(random_part FROM 1 FOR 4) || '-' ||
         SUBSTRING(random_part FROM 5 FOR 4) || '-' ||
         SUBSTRING(random_part FROM 9 FOR 4) || '-' ||
         SUBSTRING(random_part FROM 13 FOR 4);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Generate invoice number
-- ============================================================================

CREATE OR REPLACE FUNCTION ksp_generate_invoice_number()
RETURNS VARCHAR AS $$
DECLARE
  seq_val BIGINT;
  date_part VARCHAR;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 13) AS BIGINT)
  ), 0) + 1 INTO seq_val
  FROM ksp_transactions
  WHERE invoice_number LIKE 'KSP-' || date_part || '%';
  RETURN 'KSP-' || date_part || '-' || LPAD(seq_val::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE ksp_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ksp_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------
-- ksp_apps: Public read, admin write
-- ----------------------------------------
CREATE POLICY "ksp_apps_public_read"
  ON ksp_apps FOR SELECT
  USING (is_active = true);

CREATE POLICY "ksp_apps_admin_all"
  ON ksp_apps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ksp_users
      WHERE auth_user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- ----------------------------------------
-- ksp_clients: Owners see their own data
-- ----------------------------------------
CREATE POLICY "ksp_clients_own_read"
  ON ksp_clients FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "ksp_clients_own_update"
  ON ksp_clients FOR UPDATE
  USING (auth_user_id = auth.uid());

-- ----------------------------------------
-- ksp_licenses: Client can see their licenses
-- ----------------------------------------
CREATE POLICY "ksp_licenses_client_read"
  ON ksp_licenses FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- ksp_devices: Users see devices for their license
-- ----------------------------------------
CREATE POLICY "ksp_devices_license_read"
  ON ksp_devices FOR SELECT
  USING (
    license_id IN (
      SELECT id FROM ksp_licenses
      WHERE client_id IN (
        SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "ksp_devices_license_manage"
  ON ksp_devices FOR ALL
  USING (
    license_id IN (
      SELECT l.id FROM ksp_licenses l
      JOIN ksp_clients c ON c.id = l.client_id
      WHERE c.auth_user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- ksp_users: Users see their own record and co-workers in same license
-- ----------------------------------------
CREATE POLICY "ksp_users_own_read"
  ON ksp_users FOR SELECT
  USING (
    auth_user_id = auth.uid()
    OR license_id IN (
      SELECT license_id FROM ksp_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "ksp_users_owner_manage"
  ON ksp_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ksp_users u
      WHERE u.auth_user_id = auth.uid()
        AND u.role = 'owner'
        AND u.license_id = ksp_users.license_id
    )
  );

-- ----------------------------------------
-- ksp_transactions: Client sees their own
-- ----------------------------------------
CREATE POLICY "ksp_transactions_client_read"
  ON ksp_transactions FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- ksp_subscriptions: Client sees their own
-- ----------------------------------------
CREATE POLICY "ksp_subscriptions_client_read"
  ON ksp_subscriptions FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- ksp_sites: Client manages their own sites
-- ----------------------------------------
CREATE POLICY "ksp_sites_client_all"
  ON ksp_sites FOR ALL
  USING (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "ksp_sites_public_read"
  ON ksp_sites FOR SELECT
  USING (is_published = true AND is_active = true);

-- ----------------------------------------
-- ksp_site_pages: Site owner manages, public reads published
-- ----------------------------------------
CREATE POLICY "ksp_site_pages_owner_all"
  ON ksp_site_pages FOR ALL
  USING (
    site_id IN (
      SELECT id FROM ksp_sites
      WHERE client_id IN (
        SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "ksp_site_pages_public_read"
  ON ksp_site_pages FOR SELECT
  USING (
    is_published = true
    AND site_id IN (
      SELECT id FROM ksp_sites WHERE is_published = true AND is_active = true
    )
  );

-- ----------------------------------------
-- ksp_site_settings: Site owner manages
-- ----------------------------------------
CREATE POLICY "ksp_site_settings_owner_all"
  ON ksp_site_settings FOR ALL
  USING (
    site_id IN (
      SELECT id FROM ksp_sites
      WHERE client_id IN (
        SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "ksp_site_settings_public_read"
  ON ksp_site_settings FOR SELECT
  USING (
    site_id IN (
      SELECT id FROM ksp_sites WHERE is_published = true AND is_active = true
    )
  );

-- ----------------------------------------
-- ksp_logs: Client sees their own logs
-- ----------------------------------------
CREATE POLICY "ksp_logs_client_read"
  ON ksp_logs FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM ksp_clients WHERE auth_user_id = auth.uid()
    )
  );

-- ----------------------------------------
-- ksp_settings: Public settings readable by all, admin manages all
-- ----------------------------------------
CREATE POLICY "ksp_settings_public_read"
  ON ksp_settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "ksp_settings_admin_all"
  ON ksp_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ksp_users
      WHERE auth_user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- ============================================================================
-- SERVICE ROLE BYPASS (for backend functions / Edge Functions)
-- ============================================================================
-- The service_role key bypasses RLS by default in Supabase.
-- No additional policies needed for backend operations.

-- ============================================================================
-- COMPLETED: Initial schema for KASIRSOLO
-- Tables: 12 (ksp_apps, ksp_clients, ksp_licenses, ksp_devices, ksp_users,
--              ksp_transactions, ksp_subscriptions, ksp_sites, ksp_site_pages,
--              ksp_site_settings, ksp_logs, ksp_settings)
-- ENUMs: 8
-- Functions: 4 (ksp_set_updated_at, ksp_check_max_devices,
--               ksp_generate_license_key, ksp_generate_invoice_number)
-- ============================================================================
