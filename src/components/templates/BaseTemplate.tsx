'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/templates/Header';
import { LatestUpdates } from '@/components/templates/LatestUpdates';
import { MusicController } from '@/components/templates/MusicController';
import { Navigation } from '@/components/templates/Navigation';
import { SocialLinks } from '@/components/templates/SocialLinks';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* 背景画像 */}
      <div className="absolute inset-0 bg-[url(/assets/images/bg-paper-bk.jpg)] bg-cover bg-center bg-no-repeat opacity-30"></div>

      {/* ヘッダー */}
      <Header rightNav={props.rightNav} />

      {/* ナビゲーション */}
      <Navigation leftNav={props.leftNav} />

      {/* メインコンテンツエリア */}
      <main className="relative z-1 lg:ml-64">
        {/* 巨大なLunaceaタイトル */}
        <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-28 sm:pt-24 lg:pt-20 lg:px-8 overflow-x-auto">
          <div className="text-center mb-12 w-full flex flex-col items-center">
            <Link href="/" className="group">
              <h1
                className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-bold leading-none
                mb-4 tracking-widest uppercase text-neumorphism-inset whitespace-nowrap
                transition-colors duration-700 cursor-pointer lg:translate-x-0 text-center"
                style={{
                  fontFamily: 'var(--font-rajdhani), "Rajdhani", sans-serif !important',
                  textShadow: `
                    2px 2px 4px rgba(0, 0, 0, 0.4),
                    -2px -2px 4px rgba(255, 255, 255, 0.1),
                    inset 2px 2px 8px rgba(0, 0, 0, 0.5),
                    inset -2px -2px 8px rgba(255, 255, 255, 0.05)
                  `,
                  color: '#e5e7eb',
                }}
              >
                {AppConfig.name.split('').map((char, index) => (
                  char.toUpperCase() === 'C'
                    ? (
                        <ThemeToggle key={index} />
                      )
                    : (
                        <span key={index}>{char}</span>
                      )
                ))}
              </h1>
              <h2 className="
                text-xl md:text-2xl lg:text-3xl text-gray-300 tracking-wide font-heading
              group-hover:text-white transition-colors duration-300"
              >
                {t('description')}
              </h2>
              <p className="text-lg text-gray-300 font-light tracking-wide">
                Sorry, this site is under construction...🔧
              </p>
            </Link>
          </div>

          {/* 子コンテンツ */}
          <div className="w-full max-w-6xl">
            {props.children}
          </div>
        </div>
      </main>

      {/* 音楽コントローラー */}
      <MusicController />

      {/* 最新情報 */}
      <LatestUpdates />

      {/* ソーシャルリンク */}
      <SocialLinks />
    </div>
  );
};
