'use client';

import { routing, usePathname } from '@/libs/i18nNavigation';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export const LocaleSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    router.push(`/${newLocale}${pathname}`);
    router.refresh();
  };

  return (
    <div className="flex rounded-md overflow-hidden shadow-sm" aria-label="言語切替">
      {routing.locales.map(langCode => (
        <button
          key={langCode}
          onClick={() => handleLocaleChange(langCode)}
          className={`
            px-3 py-1.5 text-sm font-medium transition-colors
            ${locale === langCode
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }
          `}
          aria-current={locale === langCode ? 'true' : 'false'}
        >
          {langCode.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
