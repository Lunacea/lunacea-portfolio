import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { BaseTemplate } from '@/templates/BaseTemplate';

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
            <ul className="flex flex-col space-y-6 text-xl">
              <li className="relative">
                <Link
                  href="/about/"
                  className="group relative text-gray-300 hover:text-white transition-all duration-300 text-lg font-medium block py-2 pl-4"
                >
                  <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-blue-400 to-purple-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></span>
                  {t('about_link')}
                </Link>
              </li>
              <li className="relative">
                <Link
                  href="/works/"
                  className="group relative text-gray-300 hover:text-white transition-all duration-300 text-lg font-medium block py-2 pl-4"
                >
                  <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-blue-400 to-purple-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></span>
                  {t('portfolio_link')}
                </Link>
              </li>
              <li className="relative">
                <Link
                  href="/contact/"
                  className="group relative text-gray-300 hover:text-white transition-all duration-300 text-lg font-medium block py-2 pl-4"
                >
                  <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-blue-400 to-purple-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></span>
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
