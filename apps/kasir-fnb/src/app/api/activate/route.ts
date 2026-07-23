import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@kasirsolo/db";
import {
  getLicenseByKey,
  getDeviceByFingerprint,
  bindDevice,
  countActiveDevices,
} from "@kasirsolo/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { license_key, fingerprint, device_name } = body;

    if (!license_key || !fingerprint) {
      return NextResponse.json(
        { error: "license_key dan fingerprint wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Validate license
    const license = await getLicenseByKey(supabase, license_key);
    if (!license) {
      return NextResponse.json(
        { error: "Kode lisensi tidak ditemukan" },
        { status: 404 }
      );
    }

    if (license.status !== "active") {
      return NextResponse.json(
        { error: `Lisensi tidak aktif (${license.status})` },
        { status: 403 }
      );
    }

    if (license.expires_at && new Date(license.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Lisensi telah kadaluarsa" },
        { status: 403 }
      );
    }

    // Check if device is already bound
    const existingDevice = await getDeviceByFingerprint(
      supabase,
      license.id,
      fingerprint
    );

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
        message: "Perangkat sudah terdaftar",
      });
    }

    // Check device slot availability
    const activeCount = await countActiveDevices(supabase, license.id);
    if (activeCount >= license.max_devices) {
      return NextResponse.json(
        {
          error: `Batas perangkat tercapai (${license.max_devices}). Lepas salah satu perangkat untuk melanjutkan.`,
          active_devices: activeCount,
          max_devices: license.max_devices,
        },
        { status: 409 }
      );
    }

    // Bind new device
    const device = await bindDevice(supabase, {
      license_id: license.id,
      fingerprint,
      device_name: device_name || null,
      device_number: activeCount + 1,
      is_active: true,
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
      message: "Perangkat berhasil diaktivasi",
    });
  } catch (error) {
    console.error("Activation error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
