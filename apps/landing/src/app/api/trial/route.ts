import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface TrialPayload {
  nama: string;
  alamat: string;
  wa: string;
  app: string;
}

function validatePayload(body: unknown): { valid: true; data: TrialPayload } | { valid: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const data = body as Record<string, unknown>;

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: { form: 'Data tidak valid' } };
  }

  const nama = String(data.nama || '').trim();
  const alamat = String(data.alamat || '').trim();
  const wa = String(data.wa || '').trim().replace(/\D/g, '');
  const app = String(data.app || '').trim();

  if (nama.length < 3) {
    errors.nama = 'Nama minimal 3 karakter';
  }
  if (alamat.length < 5) {
    errors.alamat = 'Alamat minimal 5 karakter';
  }
  if (wa.length < 10 || wa.length > 15) {
    errors.wa = 'Nomor WA harus 10-15 digit';
  }
  if (!app) {
    errors.app = 'Pilih aplikasi yang diinginkan';
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: { nama, alamat, wa, app } };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validatePayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const { data } = validation;

    // Skip DB operations if Supabase is not configured
    if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('your-project')) {
      return NextResponse.json({
        success: true,
        message: 'Trial berhasil didaftarkan (demo mode)',
        client: { id: 'demo', ...data, status: 'trial' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing trial with same WA number
    const { data: existing } = await supabase
      .from('ksp_clients')
      .select('id, status')
      .eq('wa', data.wa)
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

    // Create client with trial status
    const { data: client, error: clientError } = await supabase
      .from('ksp_clients')
      .insert({
        nama: data.nama,
        alamat: data.alamat,
        wa: data.wa,
        app: data.app,
        status: 'trial',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (clientError) {
      console.error('Supabase client error:', clientError);
      return NextResponse.json(
        { success: false, errors: { form: 'Gagal mendaftarkan trial. Coba lagi.' } },
        { status: 500 }
      );
    }

    // Log the trial registration
    await supabase.from('ksp_logs').insert({
      action: 'trial_registered',
      entity_type: 'client',
      entity_id: client.id,
      details: {
        nama: data.nama,
        app: data.app,
        source: 'landing_page',
      },
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Trial berhasil didaftarkan!',
      client: {
        id: client.id,
        nama: client.nama,
        status: client.status,
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
