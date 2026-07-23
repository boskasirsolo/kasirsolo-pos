import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
