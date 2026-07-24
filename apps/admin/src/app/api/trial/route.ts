import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase.server";

const trialRequestSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().min(10, "Nomor telepon tidak valid"),
  email: z.string().email("Email tidak valid").optional().nullable(),
  business_name: z.string().min(2, "Nama bisnis minimal 2 karakter"),
  app_id: z.string().uuid("App ID tidak valid"),
  source: z.string().optional().default("website"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = trialRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, phone, email, business_name, app_id, source } = parsed.data;

    const supabase = getSupabaseServer();

    // Check if phone already exists
    const { data: existing } = await supabase
      .from("ksp_clients")
      .select("id, status")
      .eq("phone", phone)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Nomor telepon sudah terdaftar", client_id: existing.id },
        { status: 409 }
      );
    }

    // Generate app code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    const appCode = `KSP-${code}`;

    const now = new Date().toISOString();
    const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create client record
    const { data: client, error: clientError } = await supabase
      .from("ksp_clients")
      .insert({
        name: business_name,
        phone,
        email: email || null,
        app_code: appCode,
        status: "trial",
        trial_started: now,
        trial_expires: trialExpires,
        trial_extended: false,
        source,
        notes: `Trial request dari ${name}`,
      })
      .select()
      .single();

    if (clientError) {
      console.error("Error creating client:", clientError);
      return NextResponse.json(
        { error: "Gagal membuat akun trial" },
        { status: 500 }
      );
    }

    // Create trial license
    const { error: licenseError } = await supabase.from("ksp_licenses").insert({
      client_id: client.id,
      app_id,
      license_key: appCode,
      plan_type: "trial",
      status: "active",
      max_devices: 1,
      purchased_at: now,
      expires_at: trialExpires,
      amount_paid: 0,
      auto_renew: false,
    });

    if (licenseError) {
      console.error("Error creating license:", licenseError);
    }

    // Log the activity
    await supabase.from("ksp_activity_logs").insert({
      action: "trial_created",
      entity_type: "client",
      entity_id: client.id,
      details: { name, phone, business_name, app_id, source },
    });

    return NextResponse.json(
      {
        success: true,
        client_id: client.id,
        app_code: appCode,
        trial_expires: trialExpires,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Trial API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
