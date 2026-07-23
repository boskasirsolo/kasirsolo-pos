# Device Management Flow

## Overview

Each KASIRSOLO license allows a maximum of 2 active devices by default. This document explains the device binding, unbinding, and management flows.

---

## Concepts

| Term | Definition |
|------|-----------|
| **Device** | A browser instance identified by a fingerprint |
| **Fingerprint** | A unique string generated from browser/device characteristics |
| **Device Number** | Slot assignment (1 or 2) within a license |
| **Binding** | Associating a device fingerprint with a license slot |
| **Unbinding** | Removing a device from a license slot |

---

## Device Fingerprinting

The device fingerprint is generated client-side using a combination of:

```typescript
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    // Canvas fingerprint
    getCanvasFingerprint(),
    // WebGL renderer
    getWebGLRenderer(),
  ];

  return hashSHA256(components.join('|'));
}
```

The fingerprint is stable across sessions but may change if the user:
- Updates their browser significantly
- Changes display settings
- Clears browser data (some components)

---

## Bind Device Flow

```
APP STARTUP (first time on this device)
        |
        v
+-------------------+
| Generate device   |
| fingerprint       |
+--------+----------+
         |
         v
+--------+----------+
| Query ksp_devices |
| WHERE license_id  |
| AND fingerprint   |
+--------+----------+
         |
    +----+----+
    |         |
  FOUND     NOT FOUND
  (already  (new device)
  bound)        |
    |           v
    |    +------+------+
    |    | Count active |
    |    | devices for  |
    |    | this license |
    |    +------+------+
    |           |
    |      +----+----+
    |      |         |
    |    < MAX     >= MAX
    |      |         |
    |      v         v
    |   BIND      SHOW ERROR
    |   DEVICE    "Batas perangkat
    |      |       tercapai (2/2).
    |      |       Lepas perangkat
    |      |       lain terlebih
    |      |       dahulu."
    |      |
    v      v
+---+------+---+
| Device is    |
| now active   |
| Update       |
| last_seen_at |
+--------------+
```

### Bind Operation

```typescript
async function bindDevice(licenseId: string, fingerprint: string, deviceName: string) {
  // Find next available device number
  const existingDevices = await supabase
    .from('ksp_devices')
    .select('device_number')
    .eq('license_id', licenseId)
    .eq('is_active', true)
    .order('device_number');

  const usedNumbers = new Set(existingDevices.data?.map(d => d.device_number));
  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) nextNumber++;

  // Insert device (trigger will enforce max_devices)
  const { data, error } = await supabase
    .from('ksp_devices')
    .insert({
      license_id: licenseId,
      fingerprint,
      device_name: deviceName || `Perangkat ${nextNumber}`,
      device_number: nextNumber,
      is_active: true,
      user_agent: navigator.userAgent,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('Maximum active devices')) {
      throw new Error('Batas perangkat tercapai');
    }
    throw error;
  }

  // Log
  await supabase.from('ksp_logs').insert({
    license_id: licenseId,
    action: 'device.bind',
    description: `Device ${nextNumber} bound: ${deviceName}`,
    metadata: { fingerprint, device_number: nextNumber },
  });

  return data;
}
```

---

## Unbind Device Flow

```
SETTINGS > LICENSE > DEVICES
        |
        v
+-------------------+
| Device List       |
|                   |
| [1] Kasir Utama   |
|     Chrome/Win    |
|     Aktif sejak   |
|     20 Jul 2026   |
|     [Lepas]       |
|                   |
| [2] HP Owner      |
|     Chrome/Android|
|     Aktif sejak   |
|     21 Jul 2026   |
|     [Lepas]       |
+--------+----------+
         |
    Click [Lepas]
         |
         v
+--------+----------+
| Confirm Dialog    |
| "Yakin ingin      |
|  melepas perangkat|
|  ini? Perangkat   |
|  tidak bisa       |
|  mengakses app    |
|  sampai di-bind   |
|  ulang."          |
| [Batal] [Lepas]   |
+--------+----------+
         |
    Click [Lepas]
         |
         v
+--------+----------+
| UPDATE ksp_devices|
| SET is_active =   |
|     false         |
| WHERE id = device |
+--------+----------+
         |
         v
+--------+----------+
| Log: device.unbind|
+--------+----------+
         |
         v
  Device slot freed
  (another device can
   now bind to this
   license)
```

### Self-Unbind
A device can unbind itself:
```
SETTINGS > LICENSE > "Lepas Perangkat Ini"
  --> Unbind current device
  --> Redirect to login
  --> Device must re-bind to access app
```

### Remote Unbind
The owner can unbind any device from the device management screen, even if that device is not currently being used. This is useful when:
- A device was lost/stolen
- The device was sold/given away
- The user wants to move the license to a new device

---

## Device Limit Enforcement

The device limit is enforced at two levels:

### 1. Database Trigger (Server-side)
```sql
-- ksp_check_max_devices() trigger
-- Prevents INSERT or UPDATE (reactivation) if active count >= max_devices
```

### 2. Application Check (Client-side)
```typescript
async function canBindDevice(licenseId: string): Promise<boolean> {
  const { count } = await supabase
    .from('ksp_devices')
    .select('*', { count: 'exact', head: true })
    .eq('license_id', licenseId)
    .eq('is_active', true);

  const { data: license } = await supabase
    .from('ksp_licenses')
    .select('max_devices')
    .eq('id', licenseId)
    .single();

  return (count ?? 0) < (license?.max_devices ?? 2);
}
```

---

## Device Information Display

The device management screen shows:

```
+--------------------------------------------------+
|  Perangkat Anda (2/2 aktif)                      |
|                                                  |
|  +--------------------------------------------+  |
|  | [1] Kasir Utama                    [Aktif]  |  |
|  | Chrome 120 / Windows 10                     |  |
|  | IP: 103.xxx.xxx.xxx                         |  |
|  | Terhubung sejak: 20 Jul 2026                |  |
|  | Terakhir aktif: 2 menit lalu                |  |
|  |                              [Lepas]        |  |
|  +--------------------------------------------+  |
|                                                  |
|  +--------------------------------------------+  |
|  | [2] HP Owner                       [Aktif]  |  |
|  | Chrome 120 / Android 14                     |  |
|  | IP: 36.xxx.xxx.xxx                          |  |
|  | Terhubung sejak: 21 Jul 2026                |  |
|  | Terakhir aktif: 1 hari lalu                 |  |
|  |                              [Lepas]        |  |
|  +--------------------------------------------+  |
|                                                  |
|  Perangkat ini: Kasir Utama                      |
+--------------------------------------------------+
```

---

## Heartbeat / Last Seen

Active devices send a heartbeat to update `last_seen_at`:

```typescript
// Run every 5 minutes while app is active
async function heartbeat(deviceId: string) {
  await supabase
    .from('ksp_devices')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', deviceId);
}
```

This helps the owner identify:
- Which devices are actively being used
- Stale devices that can be safely unbound

---

## Edge Cases

### Same Device, Different Browser
Different browsers on the same physical device generate different fingerprints. Each counts as a separate device slot.

### Browser Data Cleared
If a user clears browser data, the cached device ID is lost. The fingerprint may still match the existing device record. If the fingerprint matches, the same device slot is reused.

### Max Devices Increased
The admin can increase `max_devices` for enterprise clients:
```sql
UPDATE ksp_licenses SET max_devices = 5 WHERE id = '<license-id>';
```
This immediately allows more devices to bind without unbinding existing ones.
