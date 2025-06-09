'use client';

import { Header } from '@/components/templates/Header';
import { LocaleSwitcher } from '@/components/templates/LocaleSwitcher';
import { MusicController } from '@/components/templates/MusicController';
import { NavigationLinks } from '@/components/templates/NavigationLinks';
import { SocialLinks } from '@/components/templates/SocialLinks';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-background text-foreground relative transition-all duration-500">
      {/* テーマ対応背景画像 */}
      <div className="absolute inset-0 bg-theme-paper bg-theme-overlay"></div>

      {/* ヘッダー（ナビゲーションとロケールスイッチャーを含む） */}
      <Header
        leftNav={<NavigationLinks />}
        rightNav={<LocaleSwitcher />}
      />

      {/* メインコンテンツエリア */}
      <main className="relative lg:ml-64">
        {/* 巨大なLunaceaタイトル */}
        <div className="flex flex-col w-full items-center justify-center pt-28 sm:pt-24 lg:pt-20">
          <div className="text-center w-full flex flex-col items-center overflow-x-clip">
            <h1
              className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-semibold leading-none
                mb-4 tracking-widest uppercase text-neumorphism-theme whitespace-nowrap
               lg:translate-x-0 text-center font-rajdhani"
            >
              {AppConfig.name.split('').map((char, index) => {
                const charOccurrence = AppConfig.name.split('').slice(0, index + 1).filter(c => c.toLowerCase() === char.toLowerCase()).length;

                return char.toUpperCase() === 'C'
                  ? (
                      <ThemeToggle key={`theme-toggle-c-${AppConfig.name}-${char.toLowerCase()}-${charOccurrence}`} />
                    )
                  : (
                      <span key={`char-${AppConfig.name}-${char.toLowerCase()}-${charOccurrence}`}>{char}</span>
                    );
              })}
            </h1>
          </div>

          {/* 子コンテンツ */}
          <div className="w-full max-w-6xl">
            {props.children}
          </div>
        </div>
      </main>

      {/* 音楽コントローラー */}
      <div className="fixed bottom-6 right-6 z-1 flex items-center gap-2">
        <MusicController />
      </div>

      {/* ソーシャルリンク */}
      <div className="flex fixed bottom-6 left-6 z-99 flex-row gap-2">
        <SocialLinks />
      </div>
    </div>
  );
};
