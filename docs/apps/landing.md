# Landing Page App

## Overview

The Landing app is the public-facing marketing website for KASIRSOLO. It showcases the 8 products, handles trial registration, and drives conversions.

**Path**: `apps/landing/`
**URL**: `kasirsolo.com`
**Framework**: Next.js 15 (App Router, SSG/ISR)
**Auth Required**: No (public), except for trial registration

---

## Routes

```
/                           # Homepage
/produk                     # All products overview
/produk/[slug]              # Individual product page (retail, bengkel, etc.)
/harga                      # Pricing page
/tentang                    # About page (company info)
/kontak                     # Contact page + WhatsApp CTA
/blog                       # Blog/articles (future)
/blog/[slug]                # Blog post
|
/coba-gratis                # Trial registration form
/coba-gratis/berhasil       # Registration success page
|
/login                      # Redirect to app login
/privacy                    # Privacy policy
/terms                      # Terms of service
```

---

## Page Sections

### Homepage (`/`)

1. **Hero Section**
   - Headline: "Solusi Kasir Digital untuk Bisnis Anda"
   - Subheadline: "8 aplikasi spesialis, satu platform"
   - CTA: "Coba Gratis 14 Hari"
   - Background: Brand gradient (Primary #FF5F1F to Secondary #F7A237)

2. **Products Grid**
   - 8 product cards with icon, name, price, category badge
   - Click to `/produk/[slug]`
   - Fetched from `ksp_apps` (ISR, revalidate every hour)

3. **Features Highlight**
   - Offline First: "Tetap jalan tanpa internet"
   - Multi Device: "2 perangkat, 1 lisensi"
   - Easy: "Setup 5 menit, langsung pakai"
   - Affordable: "Mulai Rp200.000"

4. **How It Works**
   - Step 1: Pilih aplikasi
   - Step 2: Coba gratis 14 hari
   - Step 3: Bayar & aktivasi
   - Step 4: Jalankan bisnis

5. **Testimonials** (future)
   - Customer quotes and photos

6. **Pricing Summary**
   - Three columns: Offline, Cloud Monthly, Cloud Yearly
   - Feature comparison table
   - CTA to `/harga`

7. **FAQ**
   - Accordion with common questions

8. **Footer**
   - Company info, addresses
   - WhatsApp button
   - Social links
   - Legal links (privacy, terms)

### Product Page (`/produk/[slug]`)

1. **Hero** with app icon, name, category, price
2. **Feature list** from `ksp_apps.features` JSONB
3. **Screenshots/mockups** gallery
4. **Pricing** for this specific app
5. **CTA**: "Coba Gratis" button
6. **Related products** from same category

### Pricing Page (`/harga`)

1. **Pricing cards** per app with plan comparison
2. **Plan comparison table** (Offline vs Cloud Monthly vs Cloud Yearly)
3. **FAQ** about pricing
4. **CTA**: Trial registration

---

## Trial Flow

```
1. User clicks "Coba Gratis 14 Hari" on any page
2. Navigates to /coba-gratis
3. Form:
   - Nama lengkap (required)
   - Nama bisnis (required)
   - Email (required, unique)
   - WhatsApp (required)
   - Kota (required)
   - Aplikasi yang diminati (select from ksp_apps)
4. Submit:
   a. Create auth.user via Supabase Auth (email + auto-generated password)
   b. Create ksp_clients record
   c. Create ksp_licenses record (status: trial, trial_ends_at: +14 days)
   d. Create ksp_users record (role: owner)
   e. Send welcome email with login credentials
   f. Send WhatsApp notification to admin
5. Redirect to /coba-gratis/berhasil
6. Success page:
   - "Terima kasih! Akun trial Anda sudah aktif"
   - Login link to the selected app
   - WhatsApp support link
```

---

## SEO Strategy

- Each page has unique meta title and description
- Product pages use structured data (JSON-LD Product schema)
- Sitemap generated automatically
- OpenGraph and Twitter card meta tags
- Indonesian language (`<html lang="id">`)

---

## Performance

- Static generation (SSG) for all pages
- ISR for product data (revalidate: 3600 seconds)
- Image optimization via Next.js Image component
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Lighthouse score target: 90+

---

## Analytics

- Google Analytics 4 (configurable via ksp_settings)
- Conversion tracking on trial registration
- UTM parameter support for marketing campaigns

---

## Design

- **Primary Color**: #FF5F1F (orange-red)
- **Secondary Color**: #F7A237 (amber)
- **Accent Color**: #FFCE55 (gold)
- **Font**: Inter (headings and body)
- **Style**: Modern, clean, Indonesian business-friendly
- **Mobile-first**: Responsive design, optimized for mobile users on slow networks
