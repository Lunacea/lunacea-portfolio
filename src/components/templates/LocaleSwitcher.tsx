'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { routing, usePathname } from '@/libs/i18nNavigation';

export const LocaleSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleLocaleChange = (newLocale: string) => {
    router.push(`/${newLocale}${pathname}`);
    router.refresh();
  };

  return (
    <div className="flex gap-1" aria-label="言語切替">
      {routing.locales.map(langCode => (
        <button
          type="button"
          key={langCode}
          onClick={() => handleLocaleChange(langCode)}
          className={`
            px-2 py-1 text-sm font-medium transition-all duration-200 rounded min-w-[36px]
            ${locale === langCode
          ? 'text-foreground bg-primary/20 dark:text-white dark:bg-white/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10'
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
