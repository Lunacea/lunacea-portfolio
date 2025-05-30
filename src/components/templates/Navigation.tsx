'use client';

import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Icon } from '@/components/Icon';

export type NavigationProps = {
  leftNav: React.ReactNode;
};

export const Navigation = ({ leftNav }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 左側ナビゲーション - デスクトップ */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 z-1">
        <div className="flex flex-col justify-center pl-8 pr-4 space-y-8">
          <div className="space-y-6">
            {leftNav}
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
            {leftNav}
          </div>
        </div>
      </nav>
    </>
  );
};
