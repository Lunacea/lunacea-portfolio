'use client';

import { useState } from 'react';

export type HeaderProps = {
  leftNav?: React.ReactNode;
  rightNav?: React.ReactNode;
};

export const Header = ({ leftNav, rightNav }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* デスクトップナビゲーション - 左側固定 */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 z-1">
        <div className="flex flex-col justify-center pl-8 lg:pr-4 space-y-8">
          <div className="space-y-6">
            {leftNav}
          </div>
        </div>
      </nav>

      {/* デスクトップヘッダー - 右上固定 */}
      <header className="hidden lg:block fixed top-6 right-6 z-50">
        <nav className="flex items-center gap-3">
          {rightNav}
        </nav>
      </header>

      {/* モバイルヘッダー - 右上固定 (LocaleSwitcher + ハンバーガーメニュー) */}
      <header className="lg:hidden fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* LocaleSwitcher */}
        {rightNav}

        {/* ハンバーガーメニューボタン */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 rounded-lg group z-99"
          aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={`block w-6 h-0.5 bg-slate-600/70 dark:bg-white/70 group-hover:bg-slate-800 dark:group-hover:bg-white rounded-full transform transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-slate-600/70 dark:bg-white/70 group-hover:bg-slate-800 dark:group-hover:bg-white rounded-full transform transition-all duration-300 ease-in-out my-1.5 ${
                isMobileMenuOpen ? 'opacity-0 scale-0' : ''
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-slate-600/70 dark:bg-white/70 group-hover:bg-slate-800 dark:group-hover:bg-white rounded-full transform transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </div>
        </button>
      </header>

      {/* モバイルメニュー */}
      <nav className={`lg:hidden fixed inset-0 z-2 bg-white/95 dark:bg-black/90 backdrop-blur-sm transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      >
        <div className="flex flex-col justify-center items-center h-full space-y-8 text-2xl">
          <div
            className="space-y-6 mobile-nav-container"
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setIsMobileMenuOpen(false);
              }
            }}
            role="button"
            tabIndex={0}
          >
            {leftNav}
          </div>
        </div>
      </nav>
    </>
  );
};
