'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/templates/Header';
import { MusicController } from '@/components/templates/MusicController';
import { Navigation } from '@/components/templates/Navigation';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0 bg-[url(/assets/images/bg-paper-bk.jpg)] bg-cover bg-center bg-no-repeat opacity-30"></div>

      {/* 暗いオーバーレイでマット感を追加 */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* ヘッダー */}
      <Header rightNav={props.rightNav} />

      {/* ナビゲーション */}
      <Navigation leftNav={props.leftNav} />

      {/* メインコンテンツエリア */}
      <main className="relative z-1 lg:ml-64">
        {/* 巨大なLunaceaタイトル */}
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center mb-12">
            <Link href="/" className="group">
              <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-black leading-none mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hover:scale-105 transition-transform duration-500 cursor-pointer tracking-wider">
                {AppConfig.name}
              </h1>
              <h2 className="text-xl md:text-2xl lg:text-3xl text-gray-300 font-light tracking-wide group-hover:text-white transition-colors duration-300">
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
    </div>
  );
};
