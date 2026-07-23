# License Flow

## Overview

The license flow covers the complete lifecycle of a KASIRSOLO license: from purchase through activation to renewal and upgrade.

---

## License Lifecycle

```
                +----------+
                |  TRIAL   |
                | (14 days)|
                +----+-----+
                     |
              +------+------+
              |             |
         PURCHASE      EXPIRED
              |             |
              v             v
         +--------+   +---------+
         | ACTIVE |   | EXPIRED |
         +----+---+   +----+----+
              |             |
     +--------+--------+   |
     |        |         |   |
  RENEW    UPGRADE   EXPIRE |
     |        |         |   |
     v        v         v   v
  +------+ +------+ +----------+
  |ACTIVE| |ACTIVE| | EXPIRED  |
  |(new  | |(new  | | (grace   |
  | term)| | plan)| |  7 days) |
  +------+ +------+ +-----+----+
                           |
                      NO PAYMENT
                           |
                           v
                    +-----------+
                    | SUSPENDED |
                    +-----------+
```

---

## Purchase Flow

### Step 1: Client Selects a Plan

From the app (trial expired screen) or landing page:

```
+----------------------------------------------------+
|  Pilih Paket untuk Kasir Retail                     |
|                                                     |
|  [Offline]        [Cloud Bulanan]  [Cloud Tahunan]  |
|  Rp250.000        Rp250.000/bln   Rp200.000/bln    |
|  sekali bayar     bisa batal      hemat 20%         |
|                   kapan saja      Rp2.400.000/thn   |
|                                                     |
|  [v] Offline      [v] Sync cloud  [v] Sync cloud   |
|  [v] 2 perangkat  [v] 2 perangkat [v] 2 perangkat  |
|  [v] Mode offline [v] Mode offline[v] Mode offline  |
|  [ ] Portfolio    [v] Portfolio   [v] Portfolio     |
|  [ ] Dashboard    [v] Dashboard   [v] Dashboard     |
|                                                     |
|              [Pilih Paket]                          |
+----------------------------------------------------+
```

### Step 2: Payment

```
CLIENT                          SYSTEM                         ADMIN
  |                                |                              |
  |  Select plan                   |                              |
  |------------------------------->|                              |
  |                                |                              |
  |  Show payment instructions     |                              |
  |  - Bank BCA: 123-456-789      |                              |
  |  - Bank Mandiri: 987-654-321  |                              |
  |  - QRIS code                   |                              |
  |  - Amount: Rp250.000          |                              |
  |  - Invoice: KSP-20260722-0001 |                              |
  |<-------------------------------|                              |
  |                                |                              |
  |  CREATE ksp_transactions       |                              |
  |  (status: pending)             |                              |
  |                                |                              |
  |  Transfer payment              |                              |
  |------------------------------->|                              |
  |                                |                              |
  |  Confirm via WhatsApp          |  Notification: new payment   |
  |  "Sudah transfer Rp250rb      |------------------------------>|
  |   a/n Ahmad, invoice           |                              |
  |   KSP-20260722-0001"          |  Verify payment              |
  |                                |<-----------------------------|
  |                                |                              |
  |                                |  UPDATE ksp_transactions     |
  |                                |  (status: paid, paid_at)     |
  |                                |                              |
  |                                |  UPDATE ksp_licenses         |
  |                                |  (status: active,            |
  |                                |   activated_at: now,         |
  |                                |   plan_type: selected)       |
  |                                |                              |
  |  Activation email              |                              |
  |<-------------------------------|                              |
  |                                |                              |
  |  License now ACTIVE            |                              |
```

### Step 3: Transaction Record

```json
{
  "client_id": "<client-uuid>",
  "license_id": "<license-uuid>",
  "invoice_number": "KSP-20260722-0001",
  "amount": 250000,
  "discount": 0,
  "tax": 0,
  "total": 250000,
  "currency": "IDR",
  "payment_method": "bank_transfer",
  "payment_reference": "BCA-20260722-xxxx",
  "status": "paid",
  "description": "Kasir Retail - Offline Plan",
  "paid_at": "2026-07-22T10:30:00Z"
}
```

---

## Activation Flow

After payment is confirmed:

```
1. ksp_transactions.status = 'paid'
2. ksp_licenses.status = 'active'
3. ksp_licenses.activated_at = NOW()
4. ksp_licenses.plan_type = selected_plan

IF plan is cloud_monthly or cloud_yearly:
  5. CREATE ksp_subscriptions
     (plan_type, amount, billing_cycle_day,
      current_period_start, current_period_end,
      next_billing_at)
  6. ksp_licenses.expires_at = subscription.current_period_end

IF plan is offline:
  5. ksp_licenses.expires_at = NULL (never expires)

7. Log: license.activate
8. Send activation email/WhatsApp
```

---

## License Key Format

```
XXX-XXXX-XXXX-XXXX-XXXX

Where XXX = first 3 letters of app slug (uppercase)
XXXX groups = hex characters from UUID hash

Examples:
  RET-A1B2-C3D4-E5F6-G7H8  (Kasir Retail)
  BEN-9F3E-2D1C-8A7B-6543  (Bengkel)
  MAS-F1E2-D3C4-B5A6-9876  (Masjid)
```

Generated by `ksp_generate_license_key(app_slug)` function.

---

## Renewal Flow (Cloud Plans)

```
7 DAYS BEFORE EXPIRY:
  Send reminder: "Langganan Anda akan berakhir tanggal XX"
  
3 DAYS BEFORE EXPIRY:
  Send reminder: "Segera perpanjang langganan Anda"

EXPIRY DATE:
  ksp_subscriptions.status = 'past_due'
  Send notification: "Langganan Anda sudah jatuh tempo"

+7 DAYS GRACE PERIOD:
  Still accessible, but with warning banner
  Daily reminders

AFTER GRACE PERIOD (no payment):
  ksp_licenses.status = 'expired'
  ksp_subscriptions.status = 'expired'
  App in read-only mode

+30 DAYS (no payment):
  ksp_licenses.status = 'suspended'
  App inaccessible (only license info screen)
  Data preserved, not deleted
```

### Successful Renewal

```
1. Client pays (same as purchase flow)
2. ksp_transactions created (status: paid)
3. ksp_subscriptions updated:
   - status = 'active'
   - current_period_start = now
   - current_period_end = now + 1 month (or 1 year)
   - next_billing_at = current_period_end
4. ksp_licenses.expires_at = subscription.current_period_end
5. Log: subscription.renew
```

---

## Offline License Validity

Offline licenses (`plan_type: 'offline'`) have special handling:

- `expires_at` is NULL (never expires after activation)
- License includes 12 months of free updates
- After 12 months: app continues to work, but no new feature updates
- To get updates: pay upgrade fee or switch to cloud plan
- No periodic validation needed (validated once at activation, cached locally)

---

## License Validation (Runtime)

```
APP STARTUP
    |
    v
Check cached license in IndexedDB (pos_settings.license_cache)
    |
    +---> Cache valid + offline --> Continue with cached license
    |
    +---> Cache expired or online --> Validate with Supabase
              |
              v
        Query ksp_licenses WHERE license_key = cached_key
              |
              +---> Status: active --> Update cache, continue
              +---> Status: trial + not expired --> Continue
              +---> Status: trial + expired --> Show trial expired screen
              +---> Status: expired --> Show expired screen + purchase CTA
              +---> Status: suspended --> Show suspended screen + contact CTA
              +---> Not found --> Show invalid license screen
```
