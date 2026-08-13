import type { Metadata } from 'next';
import './globals.css';
import { NavMenu } from '@/shared/components/navigation/NavMenu';
import { NotificationProvider } from '@/shared/contexts/NotificationContext';
import { NotificationOverlay } from '@/shared/components/navigation/NotificationOverlay';

export const metadata: Metadata = {
  title: 'УралСтройCRM — учёт строительных работ',
  description: 'Система учёта строительных работ и расчёта заработной платы',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-screen bg-white">
        <NotificationProvider>
          <NavMenu />
          <NotificationOverlay />
          <main className="flex-1 ml-72 min-h-screen pb-25 bg-[#f5f7fa]">
            <div className="w-full px-6 py-10 bg-[#f5f7fa] min-h-screen pb-25">{children}</div>
          </main>
        </NotificationProvider>
      </body>
    </html>
  );
}
