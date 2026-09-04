import type { Metadata } from 'next';
import './globals.css';
import { NavMenu } from '@/shared/components/navigation/NavMenu';
import { NotificationProvider } from '@/shared/contexts/NotificationContext';
import { NotificationOverlay } from '@/shared/components/navigation/NotificationOverlay';
import { ToastProvider } from '@/shared/components/ui/Toast';
import { LayoutWrapper } from '@/shared/components/layout/LayoutWrapper';
import { ThemeProvider } from '@/shared/contexts/ThemeContext';
import { AlertProvider } from '@/shared/components/ui/AlertProvider';

export const metadata: Metadata = {
  title: 'УралСтройCRM — учёт строительных работ',
  description: 'Система учёта строительных работ и расчёта заработной платы',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-screen">
        <NotificationProvider>
          <ThemeProvider>
            <LayoutWrapper>
              <ToastProvider>
              <AlertProvider />
              <NavMenu />
              <NotificationOverlay />
              <main className="flex-1 min-h-screen pb-25">
                <div className="w-full px-6 py-10 min-h-screen pb-25">{children}</div>
              </main>
              </ToastProvider>
            </LayoutWrapper>
          </ThemeProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
