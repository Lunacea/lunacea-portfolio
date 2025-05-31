import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';
import { Inter, Rajdhani } from 'next/font/google';

import { notFound } from 'next/navigation';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { routing } from '@/libs/i18nNavigation';
// Font Awesome設定を最初に読み込み // コメントアウトまたは削除
// import '@/lib/fontawesome'; // コメントアウトまたは削除
import '@/styles/global.css';

// Interフォントの設定（パフォーマンス最適化）
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

// Rajdhaniフォント（heading用・技術的でクリーンなフォント）
const rajdhani = Rajdhani({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-rajdhani',
  preload: true,
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata = {
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Using internationalization in Client Components
  const messages = await getMessages();

  // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
  // which dynamically adds a `style` attribute to the body tag.

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${rajdhani.variable} font-sans`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <NextIntlClientProvider
            locale={locale}
            messages={messages}
          >
            <PostHogProvider>
              {props.children}
            </PostHogProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
