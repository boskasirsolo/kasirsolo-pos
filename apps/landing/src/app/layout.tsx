import type { Metadata } from 'next';
import './landing.css';

export const metadata: Metadata = {
  title: 'KASIRSOLO - Aplikasi Kasir & Manajemen Bisnis Terlengkap | Bayar Sekali Seumur Hidup',
  description:
    'Aplikasi kasir & manajemen bisnis terlengkap untuk retail, konveksi, bengkel, klinik, apotek, masjid, TPA, dan dapur. Bayar sekali, pakai seumur hidup. Mulai dari Rp200.000.',
  keywords: [
    'aplikasi kasir',
    'kasir online',
    'pos system',
    'manajemen bisnis',
    'kasir retail',
    'kasir bengkel',
    'kasir apotek',
    'kasir klinik',
    'manajemen masjid',
    'kasirsolo',
    'bayar sekali seumur hidup',
  ],
  authors: [{ name: 'KASIRSOLO by PT Mesin Kasir Solo' }],
  creator: 'KASIRSOLO',
  publisher: 'PT Mesin Kasir Solo',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kasirsolo.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'KASIRSOLO',
    title: 'KASIRSOLO - Aplikasi Kasir & Manajemen Bisnis Terlengkap',
    description:
      'Bayar sekali, pakai seumur hidup. Aplikasi kasir & manajemen bisnis untuk retail, bengkel, apotek, klinik, dan lainnya.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KASIRSOLO - Aplikasi Kasir & Manajemen Bisnis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KASIRSOLO - Aplikasi Kasir & Manajemen Bisnis Terlengkap',
    description:
      'Bayar sekali, pakai seumur hidup. Aplikasi kasir & manajemen bisnis untuk retail, bengkel, apotek, klinik, dan lainnya.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  manifest: '/site.webmanifest',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'KASIRSOLO',
  legalName: 'PT Mesin Kasir Solo',
  url: 'https://kasirsolo.com',
  logo: 'https://kasirsolo.com/logo.png',
  description:
    'Aplikasi kasir & manajemen bisnis terlengkap. Bayar sekali, pakai seumur hidup.',
  founder: {
    '@type': 'Person',
    name: 'Amin Maghfuri',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+628816566935',
    contactType: 'customer service',
    availableLanguage: 'Indonesian',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Perum Graha Tiara 2 B1 Gumpang 07/01',
    addressLocality: 'Kartasura',
    addressRegion: 'Sukoharjo, Jawa Tengah',
    postalCode: '57169',
    addressCountry: 'ID',
  },
  sameAs: ['https://wa.me/628816566935'],
};

const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KASIRSOLO',
  operatingSystem: 'Web',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '200000',
    priceCurrency: 'IDR',
    description: 'Bayar sekali, pakai seumur hidup',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '500',
    bestRating: '5',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareJsonLd),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
