'use client';

import { useLocale } from 'next-intl';
import { Link, routing, usePathname } from '@/shared/libs/i18nNavigation';

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();

  return (
    <div className="flex gap-1" aria-label="言語切替">
      {routing.locales.map(langCode => (
        <Link
          key={langCode}
          href={pathname}
          locale={langCode}
          replace
          onClick={() => {
            try {
              document.cookie = `NEXT_LOCALE=${langCode}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
            } catch {}
          }}
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
        </Link>
      ))}
    </div>
  );
}
