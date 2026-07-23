# Product Vision

## About KASIRSOLO

KASIRSOLO is a multi-app platform providing specialized Point of Sale (POS) and management software for small to medium businesses and institutions in Indonesia. Developed by PT Mesin Kasir Solo, it offers 8 tailored applications that serve specific industry verticals.

---

## Company Information

### Developer
**PT Mesin Kasir Solo**

### Owner
**Amin Maghfuri**
- Email: owner.kasirsolo@gmail.com
- WhatsApp: 0881 6566 935 (+628816566935)

### Legal Address
Perum Graha Tiara 2 B1 Gumpang 07/01
Kartasura, Sukoharjo, Jawa Tengah 57169
Maps: https://maps.app.goo.gl/DtNwuJvY9KufJN3CA

### Operational Address
Gumiring 04/04, Sidomulyo
Banjarejo, Blora, Jawa Tengah 58253
Maps: https://maps.app.goo.gl/F9YMpuBUPMd1tcNWA

---

## Vision

**"Menyediakan solusi digital terjangkau untuk setiap usaha kecil dan institusi di Indonesia."**

(Providing affordable digital solutions for every small business and institution in Indonesia.)

### Core Beliefs
1. **Every business deserves digital tools** - Even a small warung or bengkel should have access to professional POS software.
2. **Offline-first is essential** - Internet connectivity in Indonesia is unreliable in many areas. Software must work without internet.
3. **Specialization beats generalization** - A bengkel app should understand service orders; a masjid app should understand infaq. Generic POS fails these users.
4. **Affordability is non-negotiable** - Pricing must match the reality of Indonesian small businesses (Rp200k-500k, not millions).

---

## Target Market

### Primary: Small Businesses in Java, Indonesia
- **Retail shops** (toko kelontong, minimarket, toko bangunan)
- **Garment/konveksi** businesses
- **Motorcycle/car workshops** (bengkel)
- **Pharmacies** (apotek)

### Secondary: Institutions
- **Mosques** (masjid) needing financial transparency
- **Quran schools** (TPA/TPQ) needing student management
- **Institutional kitchens** (dapur SPPG)

### Tertiary: Healthcare
- **ENT clinics** (klinik THT)
- **Pharmacies** with prescription management

### Customer Profile
- Solo entrepreneurs or small teams (1-5 people)
- Budget-conscious (Rp200k-500k for software)
- Limited technical expertise
- May have unreliable internet
- Predominantly mobile-first users (Android)
- Indonesian language preferred

---

## Product Portfolio

| # | App | Icon | Category | Price (Offline) | Target |
|---|-----|------|----------|----------------|--------|
| 1 | Kasir Retail | 🛒 | Bisnis | Rp250.000 | Toko retail, warung, minimarket |
| 2 | Manajemen Konveksi | 👕 | Bisnis | Rp350.000 | Usaha konveksi/garmen |
| 3 | Bengkel + Sparepart | 🔧 | Bisnis | Rp400.000 | Bengkel motor/mobil |
| 4 | Manajemen Masjid | 🕌 | Institusi | Rp200.000 | Pengurus masjid |
| 5 | Manajemen TPA/TPQ | 📖 | Institusi | Rp200.000 | Taman pendidikan Al-Quran |
| 6 | Klinik THT | 🩺 | Kesehatan | Rp500.000 | Klinik THT |
| 7 | Apotek | 💊 | Kesehatan | Rp450.000 | Apotek/toko obat |
| 8 | Dapur SPPG | 🍳 | Institusi | Rp300.000 | Dapur institusi/catering |

---

## Roadmap

### Phase 1: Foundation (Current)
- [x] Database schema design (ksp_* tables)
- [x] Documentation system
- [ ] Monorepo setup (Turborepo + pnpm)
- [ ] Shared packages (db, local-db, ui, utils)
- [ ] Landing page
- [ ] Admin dashboard
- [ ] Auth system (Supabase Auth)

### Phase 2: First App
- [ ] Kasir Retail (flagship POS app)
  - [ ] Product management
  - [ ] POS screen (sales)
  - [ ] Receipt printing (Bluetooth)
  - [ ] Sales reports
  - [ ] Stock management
  - [ ] Offline mode (PWA + IndexedDB)
- [ ] Trial registration flow
- [ ] License activation flow

### Phase 3: Platform Features
- [ ] Device management (bind/unbind)
- [ ] Cloud sync engine
- [ ] Portfolio site CMS
- [ ] Subscription billing
- [ ] WhatsApp notifications

### Phase 4: More Apps
- [ ] Kasir Bengkel
- [ ] Manajemen Masjid
- [ ] Kasir Apotek
- [ ] (remaining apps based on demand)

### Phase 5: Growth
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Automated billing & invoicing
- [ ] Mobile app (React Native, if needed)
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Marketplace for app add-ons

### Phase 6: Scale
- [ ] White-label option for resellers
- [ ] Multi-branch support
- [ ] Advanced analytics dashboard
- [ ] AI-powered insights (sales predictions, stock optimization)

---

## Revenue Model

### One-Time (Offline Plan)
- Client pays once per app
- Revenue: Rp200k-500k per sale
- No recurring revenue
- Supports ongoing development through volume

### Recurring (Cloud Plans)
- Monthly: Same as offline price per month
- Yearly: 20% discount
- Revenue: Predictable MRR
- Higher lifetime value per client

### Revenue Target
- Year 1: 100 paid licenses
- Year 2: 500 paid licenses, 20% cloud conversion
- Year 3: 1000+ licenses, expansion beyond Java

---

## Competitive Advantages

1. **Specialized apps**: Not a generic POS trying to do everything
2. **Offline-first**: Works without internet (many competitors require it)
3. **Affordable**: 5-10x cheaper than enterprise POS solutions
4. **Indonesian-first**: UI, language, business rules designed for Indonesian market
5. **Hybrid pricing**: Choice between one-time and subscription
6. **Modern tech**: PWA, not a legacy desktop app
7. **Portfolio sites**: Free business website for cloud customers
