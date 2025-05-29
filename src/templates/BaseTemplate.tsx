'use client';

import { faBars, faClose, faMusic, faPause, faPlay, faSpinner, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { useBGMStore } from '@/stores/bgm';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isControllerExpanded, setIsControllerExpanded] = useState(false);

  // BGMストアから必要な状態とアクションを取得
  const isPlaying = useBGMStore(state => state.isPlaying);
  const isLoading = useBGMStore(state => state.isLoading);
  const volume = useBGMStore(state => state.volume);
  const play = useBGMStore(state => state.play);
  const pause = useBGMStore(state => state.pause);
  const setVolume = useBGMStore(state => state.setVolume);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* 背景画像 */}
      <div className="absolute inset-0 bg-[url(/assets/images/bg-paper-bk.jpg)] bg-cover bg-center bg-no-repeat opacity-30"></div>

      {/* 暗いオーバーレイでマット感を追加 */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* ヘッダー - 右上のlocalization */}
      <header className="absolute top-6 right-6 z-99">
        <nav className="flex items-center gap-4">
          {props.rightNav}
          <LocaleSwitcher />
        </nav>
      </header>

      {/* 左側ナビゲーション - デスクトップ */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 z-1">
        <div className="flex flex-col justify-center pl-8 pr-4 space-y-8">
          <div className="space-y-6">
            {props.leftNav}
          </div>
        </div>
      </nav>

      {/* ハンバーガーメニューボタン - モバイル */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-6 left-6 z-99 p-3 hover:bg-white/5 transition-all duration-200 rounded-lg"
        aria-label="メニューを開く"
      >
        <Icon
          icon={faBars}
          className={`text-white/70 hover:text-white text-lg transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
        />
      </button>

      {/* モバイルメニュー */}
      <nav className={`lg:hidden fixed inset-0 z-99 bg-black/90 backdrop-blur-sm transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      >
        <div className="flex flex-col justify-center items-center h-full space-y-8 text-2xl">
          <div
            className="space-y-6 mobile-nav-container"
            role="button"
            tabIndex={0}
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsMobileMenuOpen(false);
              }
            }}
          >
            {props.leftNav}
          </div>
        </div>
      </nav>

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
            </Link>
          </div>

          {/* 子コンテンツ */}
          <div className="w-full max-w-6xl">
            {props.children}
          </div>
        </div>
      </main>

      {/* 右下の音楽コントローラエリア */}
      <div className="fixed bottom-6 right-6 z-99">
        {isControllerExpanded
          ? (
              <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10 min-w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon icon={faMusic} className="text-white/90" />
                    <span className="text-sm font-medium text-white/90 tracking-wide">Music</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsControllerExpanded(false)}
                    className="text-white/70 hover:text-white transition-colors p-1"
                    aria-label="コントローラを閉じる"
                  >
                    <Icon icon={faClose} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={isPlaying ? pause : play}
                      disabled={isLoading}
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? <Icon icon={faSpinner} spin /> : isPlaying ? <Icon icon={faPause} /> : <Icon icon={faPlay} />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Icon icon={faVolumeHigh} className="text-white/80 text-xs" />
                          <span className="text-xs text-white/80">音量</span>
                        </div>
                        <span className="text-xs text-white">
                          {Math.round(volume * 100)}
                          %
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume * 100}
                        onChange={e => setVolume(Number(e.target.value) / 100)}
                        aria-label="音量調整"
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          : (
              <button
                type="button"
                onClick={() => setIsControllerExpanded(true)}
                className="w-16 h-16 hover:bg-white/5 rounded-full flex items-center justify-center transition-all duration-200 group border border-white/10 backdrop-blur-md"
                aria-label="音楽コントローラを開く"
              >
                <Icon
                  icon={isPlaying ? faMusic : faPlay}
                  className="text-white/70 hover:text-white text-xl group-hover:scale-110 transition-all duration-200"
                />
              </button>
            )}
      </div>
    </div>
  );
};
