import type { Metadata } from 'next';

import { Geist_Mono, Plus_Jakarta_Sans, Geist } from 'next/font/google';

import { SiteShell } from '@/components/layout/site-shell';
import { ThemeProvider } from '@/components/theme/theme-provider';

import { MockDataProvider } from '@/components/common/mock-data-provider';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Socio Commerce',
  description: 'A modern social commerce platform.',
};

type RootLayoutProps = {
  readonly children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        'h-full',
        'antialiased',
        jakarta.variable,
        geistMono.variable,
        'font-sans',
        geist.variable,
      )}
    >
      <head suppressHydrationWarning />

      <body className="min-h-full">
        <ThemeProvider>
          <SiteShell>{children}</SiteShell>
          <Toaster />
        </ThemeProvider>
        <MockDataProvider />
      </body>
    </html>
  );
}
