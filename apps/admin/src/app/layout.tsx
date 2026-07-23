import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KASIRSOLO Control Center",
  description: "Admin dashboard for managing KASIRSOLO licenses, clients, and payments",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "KASIRSOLO Control Center",
    title: "KASIRSOLO Control Center",
    description: "Admin dashboard for managing KASIRSOLO licenses, clients, and payments",
    images: [
      {
        url: "/logo.png",
        width: 600,
        height: 600,
        alt: "KASIRSOLO Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full font-body antialiased">{children}</body>
    </html>
  );
}
