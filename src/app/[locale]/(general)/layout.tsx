import { BaseTemplate } from '@/templates/BaseTemplate';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

/**
 * マーケティングセクションのレイアウトコンポーネント
 * バックグラウンドエフェクトと色調整機能を提供します
 */
export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  return (
    <>
      {/* メインコンテンツ */}
      <div className="relative z-99">
        <BaseTemplate
          leftNav={(
            <ul className="flex flex-wrap gap-x-5 text-xl">
              <li>
                <Link href="/about/">
                  {t('about_link')}
                </Link>
              </li>
              <li>
                <Link href="/works/">
                  {t('portfolio_link')}
                </Link>
              </li>
              <li>
                <Link href="/contact/">
                  {t('contact_link')}
                </Link>
              </li>
            </ul>
          )}
        >
          {props.children}
        </BaseTemplate>
      </div>
    </>
  );
}
