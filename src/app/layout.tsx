import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Quick Bite Cafe | Digital QR Ordering & WhatsApp SaaS',
  description: 'Frictionless QR menu ordering, kitchen management, digital billing, and WhatsApp Birthday Club for modern cafes.',
  keywords: ['restaurant pos', 'cafe qr menu', 'digital ordering', 'whatsapp billing', 'birthday club'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900 font-sans">
        {children}
      </body>
    </html>
  );
}
