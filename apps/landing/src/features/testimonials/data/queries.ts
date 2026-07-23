/**
 * Testimonials database queries with static fallback.
 */

export interface Testimonial {
  id: string;
  name: string;
  initials: string;
  role: string;
  text: string;
  stars: number;
}

const staticTestimonials: Testimonial[] = [
  {
    id: 'static-1',
    name: 'Budi Santoso',
    initials: 'BS',
    role: 'Pemilik Toko Sejahtera, Solo',
    text: 'Sejak pakai Kasir Retail KASIRSOLO, omzet toko saya naik 30%. Stok terkontrol, laporan jelas, dan yang paling penting bayar sekali doang!',
    stars: 5,
  },
  {
    id: 'static-2',
    name: 'Siti Aminah',
    initials: 'SA',
    role: 'Pengelola Apotek Sehat, Semarang',
    text: 'Expired date tracking-nya sangat membantu. Tidak ada lagi obat kadaluarsa yang terlewat. Support WA-nya juga responsif banget.',
    stars: 5,
  },
  {
    id: 'static-3',
    name: 'Ahmad Fauzi',
    initials: 'AF',
    role: 'Takmir Masjid Al-Ikhlas, Sukoharjo',
    text: 'Alhamdulillah laporan keuangan masjid sekarang transparan. Jamaah bisa lihat langsung pemasukan dan pengeluaran. Harganya juga sangat terjangkau.',
    stars: 5,
  },
  {
    id: 'static-4',
    name: 'Dewi Rahayu',
    initials: 'DR',
    role: 'Pemilik Bengkel Jaya Motor, Blora',
    text: 'Antrian service jadi teratur, stok sparepart terpantau. Pelanggan juga senang karena ada riwayat service kendaraan mereka.',
    stars: 5,
  },
  {
    id: 'static-5',
    name: 'Hendra Wijaya',
    initials: 'HW',
    role: 'Owner Konveksi Batik Jawa, Pekalongan',
    text: 'Tracking order dari desain sampai pengiriman jadi mudah. HPP otomatis terhitung, profit margin lebih jelas. Recommended!',
    stars: 5,
  },
];

/**
 * Fetch testimonials from Supabase ksp_testimonials table.
 * Falls back to static data if Supabase is not configured or query fails.
 */
export async function fetchTestimonials(): Promise<Testimonial[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return staticTestimonials;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('ksp_testimonials')
      .select('id, name, rating, review, avatar_url')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase testimonials fetch error:', error);
      return staticTestimonials;
    }

    if (data && data.length > 0) {
      // Map DB columns to our Testimonial type
      return data.map((t) => ({
        id: t.id,
        name: t.name as string,
        initials: ((t.name as string).charAt(0)).toUpperCase(),
        role: '',
        text: t.review as string,
        stars: Math.min(Math.max(t.rating as number, 1), 5),
      }));
    }

    // No DB data, fall back to static
    return staticTestimonials;
  } catch (err) {
    console.error('Failed to fetch testimonials:', err);
    return staticTestimonials;
  }
}
