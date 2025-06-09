import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { routing } from '@/libs/i18nNavigation';

export const metadata = {
  keywords: ['Lunacea', 'Portfolio', 'Lunacea Portfolio'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Lunacea Portfolio',
    description: 'This is a portfolio website for Lunacea.',
    url: 'https://lunacea.jp',
    siteName: 'Lunacea Portfolio',
    images: [
      {
        url: 'https://lunacea.jp/ogp-2025-06-09-14_11_26.png',
        width: 1196,
        height: 860,
        alt: 'Lunacea Portfolio',
      },
    ],
  },
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

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PostHogProvider>
        {props.children}
      </PostHogProvider>
    </NextIntlClientProvider>
  );
}
