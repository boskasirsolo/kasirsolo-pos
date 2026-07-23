/**
 * FAQ database queries with static fallback.
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const staticFaqData: FaqItem[] = [
  {
    id: 'static-1',
    question: 'Apa itu KASIRSOLO?',
    answer:
      'KASIRSOLO adalah platform aplikasi kasir dan manajemen bisnis yang dikembangkan oleh PT Mesin Kasir Solo. Kami menyediakan 8 aplikasi untuk berbagai jenis bisnis dan institusi, dengan model pembayaran sekali bayar seumur hidup.',
  },
  {
    id: 'static-2',
    question: 'Bagaimana model pembayaran KASIRSOLO?',
    answer:
      'KASIRSOLO menggunakan model bayar sekali, pakai seumur hidup. Tidak ada biaya langganan bulanan atau tahunan. Anda cukup membayar satu kali saja dan aplikasi aktif selamanya, termasuk update dan support gratis.',
  },
  {
    id: 'static-3',
    question: 'Apakah ada trial gratis?',
    answer:
      'Ya! Kami menyediakan trial gratis selama 7 hari penuh dengan akses ke semua fitur tanpa batasan. Tidak perlu kartu kredit untuk mendaftar trial. Jika butuh waktu lebih, Anda bisa menghubungi kami untuk perpanjangan trial.',
  },
  {
    id: 'static-4',
    question: 'Apakah data saya aman?',
    answer:
      'Sangat aman. Data Anda dilindungi dengan enkripsi end-to-end dan disimpan di server cloud yang aman. Backup otomatis dilakukan setiap hari. Data 100% milik Anda dan tidak akan dibagikan ke pihak ketiga.',
  },
  {
    id: 'static-5',
    question: 'Bisa diakses dari HP?',
    answer:
      'Ya! Semua aplikasi KASIRSOLO berbasis web dan bisa diakses dari perangkat apapun: HP, tablet, laptop, atau PC. Data otomatis sinkron antar perangkat.',
  },
  {
    id: 'static-6',
    question: 'Bagaimana jika saya butuh bantuan?',
    answer:
      'Tim support kami siap membantu langsung via WhatsApp di nomor 0881 6566 935. Kami juga menyediakan panduan penggunaan dan training untuk memastikan Anda bisa menggunakan aplikasi dengan optimal.',
  },
  {
    id: 'static-7',
    question: 'Apakah bisa dikustomisasi?',
    answer:
      'Ya! Kami menyediakan kustomisasi gratis untuk menyesuaikan tampilan dan workflow sesuai kebutuhan bisnis Anda. Hubungi kami untuk konsultasi kebutuhan kustomisasi.',
  },
  {
    id: 'static-8',
    question: 'Berapa lama proses aktivasi?',
    answer:
      'Setelah pembayaran dikonfirmasi, akun Anda akan diaktifkan dalam waktu maksimal 1x24 jam. Untuk trial, aktivasi langsung otomatis setelah pendaftaran.',
  },
  {
    id: 'static-9',
    question: 'Apakah ada garansi uang kembali?',
    answer:
      'Kami menyediakan garansi kepuasan. Jika dalam 7 hari pertama setelah aktivasi Anda merasa tidak puas, kami akan mengembalikan uang Anda 100%. Itulah mengapa kami juga menyediakan trial gratis agar Anda bisa mencoba dulu.',
  },
];

/**
 * Fetch FAQs from Supabase ksp_faqs table.
 * Falls back to static data if Supabase is not configured or query fails.
 */
export async function fetchFaqs(): Promise<FaqItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return staticFaqData;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('ksp_faqs')
      .select('id, question, answer')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase FAQs fetch error:', error);
      return staticFaqData;
    }

    if (data && data.length > 0) {
      return data as FaqItem[];
    }

    // No DB data, fall back to static
    return staticFaqData;
  } catch (err) {
    console.error('Failed to fetch FAQs:', err);
    return staticFaqData;
  }
}
