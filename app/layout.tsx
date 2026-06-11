import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KAI — Trợ lý Học tập AI cho Học sinh Tiểu học',
  description: 'Người bạn học tập thông minh, vui nhộn và an toàn dành cho học sinh lớp 1–5 tại Việt Nam.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KAI Learning',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased select-none overflow-x-hidden">
        <div className="mx-auto min-h-screen max-w-md bg-[#F8F7FF] shadow-2xl relative flex flex-col border-x border-purple-100">
          {children}
        </div>
      </body>
    </html>
  );
}
