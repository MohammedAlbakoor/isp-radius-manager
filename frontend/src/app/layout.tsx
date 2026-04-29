import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'ISP RADIUS Manager - لوحة التحكم',
  description: 'نظام إدارة شبكات الإنترنت عبر MikroTik و FreeRADIUS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-left"
            toastOptions={{
              duration: 4000,
              style: { direction: 'rtl', fontFamily: 'Tajawal' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
