import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ColorRatiosProvider } from '@/components/ui/ColorRatiosProvider';
import Dither, { ColorToggleButtons } from '@/components/ui/Dither';
import DynamicCRTEffect from '@/components/ui/DynamicCRTEffect';
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
    <ColorRatiosProvider initialRatios={{ blue: 0.8, green: 0.1, yellow: 0.1 }}>
      <div className="relative min-h-screen">
        {/* バックグラウンドエフェクト */}
        <div className="fixed inset-0 z-1">
          {/* 波エフェクト */}
          <div className="absolute inset-0">
            <Dither
              waveSpeed={0.02}
              waveFrequency={4}
              waveAmplitude={0.05}
              enableMouseInteraction={false}
              hideColorToggle={true}
            />
          </div>

          {/* ブラー効果 */}
          <div className="absolute inset-0 backdrop-blur-sm">
            {/* 将来的に使用する可能性のあるパーティクルエフェクト
            <Particles
              particleColors={['#ffffff', '#ffffff']}
              particleCount={150}
              particleSpread={8}
              speed={0.05}
              particleBaseSize={80}
              moveParticlesOnHover={true}
              particleHoverFactor={0.1}
              alphaParticles={true}
              disableRotation={false}
              className="h-full w-full"
            /> */}
          </div>

          {/* CRTエフェクト */}
          <div className="absolute inset-0 pointer-events-none">
            <DynamicCRTEffect className="h-full w-full" />
          </div>
        </div>

        {/* 色調整ボタン */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-2 pointer-events-auto">
          <ColorToggleButtons className="pointer-events-auto" />
        </div>

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
            rightNav={(
              <ul className="flex flex-wrap gap-x-5 text-xl">
                <li>
                  <Link href="/sign-in/">
                    {t('sign_in_link')}
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up/">
                    {t('sign_up_link')}
                  </Link>
                </li>
                <li>
                  <LocaleSwitcher />
                </li>
              </ul>
            )}
          >
            {props.children}
          </BaseTemplate>
        </div>
      </div>
    </ColorRatiosProvider>
  );
}
