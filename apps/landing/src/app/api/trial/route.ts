import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// --- Rate limiting (in-memory, window-based) ---
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // exceeded
  }

  entry.count += 1;
  return true;
}

function cleanupExpiredEntries() {
  const now = Date.now();
  const keysToDelete = Array.from(rateLimitStore.entries())
    .filter(([, entry]) => now - entry.windowStart >= RATE_LIMIT_WINDOW_MS)
    .map(([ip]) => ip);
  keysToDelete.forEach((ip) => rateLimitStore.delete(ip));
}

// Cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Map app slug to ksp_apps UUID (must match seed data in 002_seed.sql)
const APP_SLUG_TO_ID: Record<string, string> = {};

async function getAppId(supabase: any, slug: string): Promise<string | null> {
  // Try cache first
  if (APP_SLUG_TO_ID[slug]) return APP_SLUG_TO_ID[slug];
  const { data, error } = await supabase.from('ksp_apps').select('id').eq('slug', slug).single();
  if (!error && data) {
    APP_SLUG_TO_ID[slug] = data.id;
    return data.id;
  }
  return null;
}

const trialPayloadSchema = z.object({
  nama: z.string().min(3, 'Nama minimal 3 karakter').trim(),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter').trim(),
  wa: z
    .string()
    .min(10, 'Nomor WA harus 10-15 digit')
    .max(15, 'Nomor WA harus 10-15 digit')
    .regex(/^\d+$/, 'Nomor WA hanya boleh berisi angka')
    .transform((val) => val.replace(/\D/g, '')),
  app: z.string().min(1, 'Pilih aplikasi yang diinginkan'),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting per IP
    const forwarded = request.headers.get('x-forwarded-for');
    const connectorIp = request.headers.get('x-vercel-connect-ip') || forwarded || 'unknown';
    if (!checkRateLimit(connectorIp)) {
      return NextResponse.json(
        { success: false, errors: { form: 'Terlalu banyak permintaan. Coba lagi dalam 10 menit.' } },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = trialPayloadSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      const errorMap = Object.entries(errors).reduce(
        (acc, [key, msgs]) => ({
          ...acc,
          [key]: msgs[0] || 'Validasi gagal',
        }),
        {} as Record<string, string>
      );
      return NextResponse.json(
        { success: false, errors: errorMap },
        { status: 400 }
      );
    }

    const { data } = validation;

    // Skip DB operations if Supabase is not configured
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project')) {
      return NextResponse.json({
        success: true,
        message: 'Trial berhasil didaftarkan (demo mode)',
        client: { id: 'demo', name: data.nama, status: 'trial' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing trial with same WA number (column is 'whatsapp')
    const { data: existing } = await supabase
      .from('ksp_clients')
      .select('id')
      .eq('whatsapp', data.wa)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          errors: { wa: 'Nomor WA sudah terdaftar. Hubungi admin untuk bantuan.' },
        },
        { status: 409 }
      );
    }

    // Resolve app slug to ksp_apps UUID
    const appId = await getAppId(supabase, data.app);
    if (!appId) {
      return NextResponse.json(
        { success: false, errors: { form: 'Aplikasi tidak valid. Silakan pilih ulang.' } },
        { status: 400 }
      );
    }

    // Generate unique placeholder email for trial (email is required NOT NULL in DB)
    const trialEmail = `${data.wa}@trial.kspsolo.app`;

    // Create client record — use actual DB column names
    const { data: client, error: clientError } = await supabase
      .from('ksp_clients')
      .insert({
        name: data.nama,
        address: data.alamat,
        whatsapp: data.wa,
        email: trialEmail,
        metadata: {
          app: data.app,
          trial_source: 'landing_page',
        },
      })
      .select('id, name')
      .single();

    if (clientError) {
      console.error('Supabase client error:', clientError);
      return NextResponse.json(
        { success: false, errors: { form: 'Gagal mendaftarkan trial. Coba lagi.' } },
        { status: 500 }
      );
    }

    // Create trial license (7 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    await supabase.from('ksp_licenses').insert({
      client_id: client.id,
      app_id: appId,
      license_key: `TRIAL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      plan_type: 'offline',
      status: 'trial',
      trial_ends_at: trialEndsAt.toISOString(),
    });

    // Log the trial registration (use valid enum value + correct column name)
    await supabase.from('ksp_logs').insert({
      action: 'auth.register',
      entity_type: 'client',
      entity_id: client.id,
      metadata: {
        name: data.nama,
        app: data.app,
        source: 'landing_page',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Trial berhasil didaftarkan!',
      client: {
        id: client.id,
        name: client.name,
      },
    });
  } catch (error) {
    console.error('Trial API error:', error);
    return NextResponse.json(
      { success: false, errors: { form: 'Terjadi kesalahan server. Coba lagi.' } },
      { status: 500 }
    );
  }
}
