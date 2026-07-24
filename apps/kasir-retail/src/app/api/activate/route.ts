import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@kasirsolo/db';
import {
  getLicenseByKey,
  getDeviceByFingerprint,
  bindDevice,
  countActiveDevices,
} from '@kasirsolo/db';

const activationPayloadSchema = z.object({
  license_key: z.string().min(1, 'Kode lisensi wajib diisi').trim(),
  fingerprint: z.string().min(1, 'Fingerprint perangkat wajib diisi').trim(),
  device_name: z.string().optional(),
});

// --- Rate limiter (in-memory, per-IP, sliding window) ---
interface RateLimitEntry {
  timestamps: number[];
}

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // max 10 requests per window

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    rateLimitStore.set(ip, { timestamps: [now] });
    return true;
  }

  // Prune old timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  entry.timestamps.push(now);
  rateLimitStore.set(ip, entry);
  return true;
}

// Clean up stale entries every ~5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitStore.entries()) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (entry.timestamps.length === 0) {
        rateLimitStore.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = activationPayloadSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      return NextResponse.json({ error: 'Validasi gagal' }, { status: 400 });
    }

    const { license_key, fingerprint, device_name } = validation.data;

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Aktivasi gagal' }, { status: 500 });
    }

    // Check rate limit by IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown';
    if (!checkRateLimit(ip)) {
      console.error('[activation] Rate limit exceeded for:', ip);
      return NextResponse.json({ error: 'Aktivasi gagal' }, { status: 429 });
    }

    // Validate license — always return generic error to prevent enumeration
    const license = await getLicenseByKey(supabase, license_key);
    if (!license || license.status !== 'active') {
      return NextResponse.json({ error: 'Aktivasi gagal' }, { status: 403 });
    }

    // Check expiration server-side
    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Aktivasi gagal' }, { status: 403 });
    }

    // Check if device is already bound
    const existingDevice = await getDeviceByFingerprint(supabase, license.id, fingerprint);

    if (existingDevice && existingDevice.is_active) {
      return NextResponse.json({
        success: true,
        device: existingDevice,
        license: {
          id: license.id,
          plan_type: license.plan_type,
          max_devices: license.max_devices,
          expires_at: license.expires_at,
        },
        message: 'Perangkat sudah terdaftar',
      });
    }

    // Check device slot availability
    const activeCount = await countActiveDevices(supabase, license.id);
    if (activeCount >= license.max_devices) {
      return NextResponse.json(
        {
          error: 'Batas perangkat tercapai',
          active_devices: activeCount,
          max_devices: license.max_devices,
        },
        { status: 403 },
      );
    }

    // Bind new device
    const device = await bindDevice(supabase, {
      license_id: license.id,
      fingerprint,
      device_name: device_name || null,
      device_number: activeCount + 1,
      is_active: true,
      last_seen_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      device,
      license: {
        id: license.id,
        plan_type: license.plan_type,
        max_devices: license.max_devices,
        expires_at: license.expires_at,
      },
      message: 'Perangkat berhasil diaktivasi',
    });
  } catch (error) {
    // Sanitized error logging — never dump full error object
    console.error('[activation] Error:', error instanceof Error ? error.message : 'unknown error');
    return NextResponse.json({ error: 'Aktivasi gagal' }, { status: 403 });
  }
}
