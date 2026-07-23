/**
 * Types for the portfolio/website CMS managed through Supabase.
 * Tables: ksp_sites, ksp_site_pages, ksp_site_settings
 */

export interface KspSite {
  /** UUID primary key */
  id: string;
  /** Site domain or subdomain slug */
  domain: string;
  /** Site display title */
  title: string;
  /** Site tagline / subtitle */
  tagline: string | null;
  /** Site description for SEO */
  description: string | null;
  /** Logo URL */
  logo_url: string | null;
  /** Favicon URL */
  favicon_url: string | null;
  /** Whether the site is published */
  is_published: boolean;
  /** JSONB theme configuration */
  theme: KspSiteTheme;
  /** JSONB navigation items */
  navigation: KspSiteNavItem[];
  /** JSONB social media links */
  socials: KspSiteSocial[];
  /** JSONB footer configuration */
  footer: Record<string, unknown> | null;
  /** Record creation timestamp */
  created_at: string;
  /** Record last update timestamp */
  updated_at: string;
}

export interface KspSiteTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  dark_color: string;
  font_heading: string;
  font_body: string;
  border_radius: string;
}

export interface KspSiteNavItem {
  label: string;
  href: string;
  is_external: boolean;
}

export interface KspSiteSocial {
  platform: string;
  url: string;
  icon: string;
}

export interface KspSitePage {
  /** UUID primary key */
  id: string;
  /** FK to ksp_sites.id */
  site_id: string;
  /** Page URL slug */
  slug: string;
  /** Page title */
  title: string;
  /** SEO meta description */
  meta_description: string | null;
  /** JSONB array of content blocks */
  content_blocks: KspSiteContentBlock[];
  /** Page sort order */
  sort_order: number;
  /** Whether the page is published */
  is_published: boolean;
  /** Record creation timestamp */
  created_at: string;
  /** Record last update timestamp */
  updated_at: string;
}

export interface KspSiteContentBlock {
  /** Block type identifier */
  type: "hero" | "features" | "pricing" | "testimonials" | "cta" | "text" | "image" | "gallery" | "faq" | "contact" | "custom";
  /** Block configuration data */
  data: Record<string, unknown>;
  /** Block sort order within the page */
  sort_order: number;
}

export interface KspSiteSettings {
  /** UUID primary key */
  id: string;
  /** FK to ksp_sites.id */
  site_id: string;
  /** Setting key */
  key: string;
  /** Setting value (JSONB) */
  value: unknown;
  /** Record last update timestamp */
  updated_at: string;
}

export type KspSiteInsert = Omit<KspSite, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type KspSiteUpdate = Partial<Omit<KspSite, "id" | "created_at">>;

export type KspSitePageInsert = Omit<KspSitePage, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type KspSitePageUpdate = Partial<Omit<KspSitePage, "id" | "site_id" | "created_at">>;
