import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createBrowserClient } from '@kasirsolo/db';

const schema = z.object({
  client_id: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'client_id tidak valid' }, { status: 400 });
    }

    const { client_id } = parsed.data;
    const supabase = createBrowserClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Fetch the client's trial license and check expiry server-side
    const { data: license, error: licenseError } = await supabase
      .from('ksp_licenses')
      .select('plan_type, status, expires_at, trial_ends_at, activated_at')
      .eq('client_id', client_id)
      .eq('plan_type', 'trial')
      .single();

    if (licenseError || !license) {
      return NextResponse.json({ error: 'Trial tidak ditemukan' }, { status: 404 });
    }

    // Check if license is active
    if (license.status !== 'active') {
      return NextResponse.json({ error: 'Lisensi tidak aktif' }, { status: 403 });
    }

    // Determine expiry from server-side dates
    const expiryDate = license.trial_ends_at || license.expires_at;
    if (!expiryDate) {
      return NextResponse.json({ error: 'Data trial tidak lengkap' }, { status: 500 });
    }

    const now = new Date();
    const expiresAt = new Date(expiryDate);
    const elapsedDays = Math.floor(
      (now.getTime() -
        (license.activated_at ? new Date(license.activated_at).getTime() : now.getTime())) /
        (1000 * 60 * 60 * 24),
    );
    const trialDays = 7;
    const daysLeft = Math.max(0, trialDays - Math.max(0, elapsedDays));

    let effectiveDaysLeft = daysLeft;
    if (elapsedDays < 0 && expiryDate) {
      const remainingMs = expiresAt.getTime() - now.getTime();
      effectiveDaysLeft = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    }

    const expired = effectiveDaysLeft <= 0;

    return NextResponse.json({
      expired,
      daysLeft: effectiveDaysLeft,
      expiresAt: expiryDate,
    });
  } catch {
    return NextResponse.json({ error: 'Gagal memverifikasi trial' }, { status: 500 });
  }
}
