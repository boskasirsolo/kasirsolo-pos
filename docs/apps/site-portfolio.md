# Portfolio Site App

## Overview

The Portfolio Site app provides each KASIRSOLO client with a customizable public website to showcase their business. It is a dynamic multi-tenant site powered by CMS data from Supabase.

**Path**: `apps/site-portfolio/`
**URL**: `kasirsolo.com/site/[slug]` or custom domain
**Framework**: Next.js 15 (App Router, ISR)
**Auth Required**: No (public site), Yes (CMS editing via admin)

---

## How It Works

```
CLIENT SETUP:
  1. Client activates cloud plan license
  2. Client creates a site via admin dashboard
  3. Chooses template (minimal, business, portfolio, landing)
  4. Fills in business info, uploads logo
  5. Creates pages (about, services, gallery, contact)
  6. Publishes site

PUBLIC ACCESS:
  Visitor --> kasirsolo.com/site/toko-maju
  OR
  Visitor --> tokomaju.com (custom domain)
         --> Next.js ISR renders page
         --> Data from ksp_sites + ksp_site_pages + ksp_site_settings
```

---

## Routes

### Public Routes (visitor-facing)

```
/site/[slug]                    # Site homepage
/site/[slug]/[page-slug]        # Site subpage (about, services, etc.)
```

### CMS Routes (embedded in admin app)

```
/admin/sites                    # List client's sites
/admin/sites/new                # Create new site
/admin/sites/[id]               # Site dashboard
/admin/sites/[id]/pages         # Manage pages
/admin/sites/[id]/pages/new     # Create page
/admin/sites/[id]/pages/[pid]   # Edit page content
/admin/sites/[id]/settings      # Site settings (theme, branding)
/admin/sites/[id]/domain        # Custom domain setup
/admin/sites/[id]/preview       # Live preview
```

---

## Template System

### Available Templates

| Template | Best For | Layout |
|----------|----------|--------|
| `minimal` | Simple businesses | Single-page, clean, fast |
| `business` | Professional services | Multi-page, sidebar navigation |
| `portfolio` | Creative/visual businesses | Gallery-focused, image-heavy |
| `landing` | Product/service launch | Single-page, sections-based |

### Template Structure

Each template is a set of React components that receive data from the CMS:

```typescript
// apps/site-portfolio/templates/minimal/index.tsx
interface TemplateProps {
  site: KspSite;
  settings: KspSiteSettings;
  pages: KspSitePage[];
  currentPage?: KspSitePage;
}

export function MinimalTemplate({ site, settings, pages, currentPage }: TemplateProps) {
  return (
    <div style={{ '--primary': settings.primary_color }}>
      <Header site={site} settings={settings} pages={pages} />
      <Main content={currentPage?.content} />
      <Footer site={site} settings={settings} />
    </div>
  );
}
```

### Content Block System

Page content is stored as JSONB in `ksp_site_pages.content`. The structure is an array of typed blocks:

```json
{
  "blocks": [
    {
      "type": "hero",
      "data": {
        "title": "Bengkel Jaya Motor",
        "subtitle": "Servis Berkualitas, Harga Terjangkau",
        "image_url": "https://...",
        "cta_text": "Hubungi Kami",
        "cta_url": "https://wa.me/62812345678"
      }
    },
    {
      "type": "text",
      "data": {
        "content": "Bengkel Jaya Motor melayani..."
      }
    },
    {
      "type": "services",
      "data": {
        "items": [
          { "name": "Servis Ringan", "price": "Rp50.000", "icon": "wrench" },
          { "name": "Ganti Oli", "price": "Rp35.000", "icon": "droplet" }
        ]
      }
    },
    {
      "type": "gallery",
      "data": {
        "images": [
          { "url": "https://...", "caption": "Workshop area" }
        ]
      }
    },
    {
      "type": "contact",
      "data": {
        "phone": "0812-345-678",
        "whatsapp": "62812345678",
        "address": "Jl. Raya Solo No. 10",
        "maps_embed": "https://maps.google.com/..."
      }
    }
  ]
}
```

### Block Types

| Block Type | Description |
|-----------|-------------|
| `hero` | Large banner with title, subtitle, CTA button |
| `text` | Rich text content (markdown supported) |
| `services` | Grid of services/products with name, price, icon |
| `gallery` | Image gallery with captions |
| `contact` | Contact information with WhatsApp link, map embed |
| `testimonials` | Customer testimonial cards |
| `features` | Feature list with icons |
| `cta` | Call to action section |
| `embed` | Embed external content (Google Maps, YouTube) |
| `divider` | Visual separator |

---

## Data Sync & Rendering

### Data Flow

```
CMS (Admin App)                    Public Site
+-------------------+              +-------------------+
| Client edits page |              | Visitor requests  |
| via block editor  |              | /site/toko-maju   |
|                   |              |                   |
| Save to Supabase  |              | Next.js ISR       |
| ksp_site_pages    +--Supabase--->+ Fetch from cache  |
| ksp_site_settings |   (source    | or revalidate     |
|                   |   of truth)  |                   |
| Publish site      |              | Render template   |
+-------------------+              | with CMS data     |
                                   +-------------------+
```

### Caching Strategy

- **ISR (Incremental Static Regeneration)**: Pages are statically generated and revalidated every 60 seconds.
- **On-demand revalidation**: When a client publishes changes, a webhook triggers revalidation of affected pages.
- **Edge caching**: Vercel's edge network caches pages globally.

```typescript
// apps/site-portfolio/app/site/[slug]/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const sites = await getPublishedSites();
  return sites.map((site) => ({ slug: site.slug }));
}

export default async function SitePage({ params }: { params: { slug: string } }) {
  const site = await getSiteBySlug(params.slug);
  const settings = await getSiteSettings(site.id);
  const pages = await getSitePages(site.id);
  const Template = getTemplate(site.template);

  return <Template site={site} settings={settings} pages={pages} />;
}
```

---

## Custom Domain

### Setup Flow

1. Client enters desired domain (e.g., `tokomaju.com`) in admin
2. System generates DNS instructions:
   - Add CNAME record: `tokomaju.com` -> `cname.vercel-dns.com`
   - Or add A record: `tokomaju.com` -> Vercel IP
3. Client configures DNS at their registrar
4. System verifies DNS propagation
5. Vercel provisions SSL certificate (automatic)
6. Custom domain goes live

### Technical Implementation

- Vercel Domains API manages custom domain routing
- `ksp_sites.custom_domain` stores the verified domain
- Middleware rewrites custom domain requests to the correct site slug
- SSL provisioned automatically by Vercel/Let's Encrypt

---

## SEO

Each portfolio site gets:
- Custom meta title and description per page (`seo_title`, `seo_description`)
- OpenGraph tags with site logo
- Structured data (LocalBusiness schema)
- Sitemap at `/site/[slug]/sitemap.xml`
- Robots.txt respecting `is_published` status
- Canonical URLs (custom domain preferred if set)

---

## Limitations

- Maximum 10 pages per site (configurable via `ksp_settings.site.max_pages`)
- File uploads via Supabase Storage (max 5MB per image)
- No custom JavaScript injection (security)
- Custom CSS limited to safe properties
- No e-commerce functionality (POS app handles sales)
