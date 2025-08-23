import type { LocalePrefixMode } from 'next-intl/routing';

const localePrefix: LocalePrefixMode = 'as-needed';

export const AppConfig = {
  name: 'LUNACEA',
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  localePrefix,
};
