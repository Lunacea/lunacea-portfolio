import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { BaseTemplate } from '@/components/templates/BaseTemplate';

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
      <div className="relative">
        <BaseTemplate
          leftNav={(
            <ul className="space-y-6 text-xl">
              <li className="relative">
                <Link
                  href="/about/"
                  className="group relative text-gray-300 hover:text-white transition-all duration-300 text-lg font-medium inline-block py-2"
                >
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                  {t('about_link')}
                </Link>
              </li>
              <li className="relative">
                <Link
                  href="/works/"
                  className="group relative text-gray-300 hover:text-white transition-all duration-300 text-lg font-medium inline-block py-2"
                >
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                  {t('portfolio_link')}
                </Link>
              </li>
              <li className="relative">
                <Link
                  href="/contact/"
                  className="group relative text-gray-300 hover:text-white transition-all duration-300 text-lg font-medium inline-block py-2"
                >
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
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
