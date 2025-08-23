import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { Inter, Rajdhani } from 'next/font/google';
import '@/shared/styles/global.css';

type Props = { children: ReactNode };

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const rajdhani = Rajdhani({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-rajdhani',
  preload: true,
  weight: ['300', '400', '500', '600', '700'],
});

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} ${rajdhani.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
