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
    <div className="min-h-screen bg-background text-foreground relative transition-all duration-500">
      {/* テーマ対応背景画像 */}
      <div className="absolute inset-0 bg-theme-paper bg-theme-overlay"></div>

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
                mb-4 tracking-widest uppercase text-neumorphism-theme whitespace-nowrap
                transition-all duration-700 cursor-pointer lg:translate-x-0 text-center font-rajdhani"
              >
                {AppConfig.name.split('').map((char, index) => (
                  char.toUpperCase() === 'C'
                    ? (
                        <ThemeToggle key={`theme-toggle-c-position-${index}-${char.toLowerCase()}`} />
                      )
                    : (
                        <span key={`char-${char.toLowerCase()}-position-${index}`}>{char}</span>
                      )
                ))}
              </h1>
              <h2 className="
                text-xl md:text-2xl lg:text-3xl text-theme-secondary tracking-wide font-heading
              group-hover:text-theme-primary transition-all duration-300"
              >
                {t('description')}
              </h2>
              <p className="text-lg text-theme-secondary font-light tracking-wide transition-all duration-300">
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
