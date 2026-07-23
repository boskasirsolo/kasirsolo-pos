# Trial Flow

## Overview

The trial flow converts website visitors into active trial users. Each trial lasts 14 days with full feature access.

---

## Flow Diagram

```
VISITOR                    LANDING PAGE               BACKEND                    DATABASE
  |                            |                         |                          |
  |  Visit kasirsolo.com      |                         |                          |
  |--------------------------->|                         |                          |
  |                            |                         |                          |
  |  Browse products           |                         |                          |
  |  (/produk, /harga)         |                         |                          |
  |--------------------------->|                         |                          |
  |                            |                         |                          |
  |  Click "Coba Gratis"      |                         |                          |
  |--------------------------->|                         |                          |
  |                            |                         |                          |
  |  /coba-gratis form         |                         |                          |
  |<---------------------------|                         |                          |
  |                            |                         |                          |
  |  Submit form               |                         |                          |
  |  (name, email, phone,     |                         |                          |
  |   business, city, app)     |                         |                          |
  |--------------------------->| Server Action            |                          |
  |                            |------------------------>|                          |
  |                            |                         |                          |
  |                            |                         |  1. Create auth.user     |
  |                            |                         |------------------------>|
  |                            |                         |                          |
  |                            |                         |  2. Create ksp_clients   |
  |                            |                         |------------------------>|
  |                            |                         |                          |
  |                            |                         |  3. Create ksp_licenses  |
  |                            |                         |  (status: trial,         |
  |                            |                         |   trial_ends_at: +14d)   |
  |                            |                         |------------------------>|
  |                            |                         |                          |
  |                            |                         |  4. Create ksp_users     |
  |                            |                         |  (role: owner)           |
  |                            |                         |------------------------>|
  |                            |                         |                          |
  |                            |                         |  5. Log: auth.register   |
  |                            |                         |------------------------>|
  |                            |                         |                          |
  |                            |  6. Send welcome email  |                          |
  |                            |<------------------------|                          |
  |                            |                         |                          |
  |                            |  7. Notify admin (WA)   |                          |
  |                            |<------------------------|                          |
  |                            |                         |                          |
  |  Redirect to success       |                         |                          |
  |<---------------------------|                         |                          |
  |                            |                         |                          |
  |  /coba-gratis/berhasil     |                         |                          |
  |  (Login link + WhatsApp)   |                         |                          |
```

---

## Registration Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Nama Lengkap | text | Yes | Min 3 chars |
| Nama Bisnis | text | Yes | Min 2 chars |
| Email | email | Yes | Valid email, unique in ksp_clients |
| WhatsApp | tel | Yes | Valid Indonesian phone |
| Kota | text | Yes | Min 2 chars |
| Aplikasi | select | Yes | One of 8 app slugs from ksp_apps |

---

## What Gets Created

### 1. auth.users (Supabase Auth)
```json
{
  "email": "user@example.com",
  "password": "<auto-generated-12-char>",
  "email_confirm": true
}
```
Password is auto-generated and sent via email. User can change it later.

### 2. ksp_clients
```json
{
  "auth_user_id": "<from step 1>",
  "name": "Ahmad Santoso",
  "business_name": "Toko Maju Jaya",
  "email": "user@example.com",
  "whatsapp": "628123456789",
  "city": "Solo",
  "is_active": true
}
```

### 3. ksp_licenses
```json
{
  "client_id": "<from step 2>",
  "app_id": "<selected app UUID>",
  "license_key": "RET-A1B2-C3D4-E5F6-G7H8",
  "plan_type": "offline",
  "status": "trial",
  "max_devices": 2,
  "trial_ends_at": "2026-08-05T00:00:00Z"
}
```

### 4. ksp_users
```json
{
  "auth_user_id": "<from step 1>",
  "license_id": "<from step 3>",
  "client_id": "<from step 2>",
  "name": "Ahmad Santoso",
  "email": "user@example.com",
  "role": "owner",
  "is_active": true
}
```

---

## Welcome Email Content

```
Subject: Selamat Datang di KASIRSOLO!

Halo Ahmad,

Akun trial Anda untuk Kasir Retail sudah aktif!

Detail akun:
- Email: user@example.com
- Password: <generated-password>
- Masa trial: 14 hari (sampai 5 Agustus 2026)

Login di: https://retail.kasirsolo.com/login

Segera ganti password Anda setelah login pertama.

Butuh bantuan? Hubungi kami di WhatsApp:
https://wa.me/628816566935

Salam,
Tim KASIRSOLO
```

---

## Admin WhatsApp Notification

```
[TRIAL BARU]
Nama: Ahmad Santoso
Bisnis: Toko Maju Jaya
Email: user@example.com
WA: 628123456789
Kota: Solo
App: Kasir Retail
Trial s/d: 05/08/2026
```

Sent to admin WhatsApp: 628816566935

---

## Trial Limitations

| Feature | Trial | Paid |
|---------|-------|------|
| All app features | Yes | Yes |
| Duration | 14 days | Unlimited (offline) or subscription |
| Max transactions | 100 | Unlimited |
| Max products | 50 | Unlimited |
| Cloud sync | No | Cloud plan only |
| Portfolio site | No | Cloud plan only |
| Support | WhatsApp | WhatsApp + Priority |

---

## Trial Expiry

```
Day 1-10:    Normal trial usage
Day 11:      Warning notification: "Trial Anda berakhir dalam 3 hari"
Day 13:      Final warning: "Trial Anda berakhir besok"
Day 14:      Trial expires
             ksp_licenses.status = 'expired'
             App shows: "Masa trial telah berakhir"
             CTA: "Aktivasi Sekarang" (link to purchase)
Day 14+:     App in read-only mode (can view data, cannot create new sales)
```

---

## Conversion: Trial to Paid

See [License Flow](./license-flow.md) for the purchase and activation process.

```
TRIAL EXPIRED
     |
     v
  "Aktivasi Sekarang" button in app
     |
     v
  Choose plan: Offline / Cloud Monthly / Cloud Yearly
     |
     v
  Payment (bank transfer / e-wallet)
     |
     v
  Admin confirms payment
     |
     v
  License activated
  status: trial --> active
  plan_type set accordingly
     |
     v
  Full access restored
  (all trial data preserved)
```
