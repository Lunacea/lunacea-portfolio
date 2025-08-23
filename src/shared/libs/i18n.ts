import { getRequestConfig } from 'next-intl/server';
import { routing } from '@/shared/libs/i18nNavigation';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
