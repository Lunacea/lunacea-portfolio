import { useUser } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
// Sponsorsモジュールが見つからないため、一時的にコメントアウト
// import { Sponsors } from './Sponsors';

export function Hello() {
  const t = useTranslations('Hello');
  const { user } = useUser();

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-white/50 p-8 backdrop-blur-sm">
      <h1 className="text-xl font-bold">{t('hello_title')}</h1>
      <p>
        {t('hello_message', {
          // emailが未定義の場合にデフォルト値を提供
          email: user?.emailAddresses[0]?.emailAddress || 'user@example.com',
        })}
      </p>
      {/* Sponsorsモジュールが見つからないため、一時的にコメントアウト
      <Sponsors />
      */}
    </div>
  );
}
