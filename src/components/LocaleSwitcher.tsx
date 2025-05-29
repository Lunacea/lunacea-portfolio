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
            px-3 py-2 text-sm font-medium transition-all duration-200 rounded-md min-w-[40px]
            ${locale === langCode
          ? 'text-white bg-white/10'
          : 'text-white/70 hover:text-white hover:bg-white/5'
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
