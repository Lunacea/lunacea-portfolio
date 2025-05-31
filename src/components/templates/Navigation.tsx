'use client';

import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

export type NavigationProps = {
  leftNav: React.ReactNode;
};

export const Navigation = ({ leftNav }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <style jsx global>
        {`
        .nav-link {
          transition: all 0.2s ease;
        }
        
        .nav-link:hover:not(.active-nav-link) {
          background: rgb(var(--muted) / 0.5);
          transform: translateX(4px);
        }
        
        .active-nav-link {
          background: rgb(var(--primary) / 0.1) !important;
          color: rgb(var(--primary)) !important;
          font-weight: 600 !important;
          border: 1px solid rgb(var(--primary) / 0.2) !important;
          position: relative;
          pointer-events: none;
          cursor: default;
        }
        
        .active-nav-link::before {
          content: '';
          position: absolute;
          left: -2px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: rgb(var(--primary));
          border-radius: 0 2px 2px 0;
        }
      `}
      </style>

      {/* 左側ナビゲーション - デスクトップ */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 z-1">
        <div className="flex flex-col justify-center pl-8 lg:pr-4 space-y-8">
          <div className="space-y-6" data-current-path={pathname || ''}>
            {leftNav}
          </div>
        </div>
      </nav>

      {/* ハンバーガーメニューボタン - モバイル */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-6 left-6 z-99 p-3 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 rounded-lg group"
        aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
      >
        {/* カスタムハンバーガーメニューアイコン */}
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          {/* 上の線 */}
          <span
            className={`block w-6 h-0.5 bg-slate-600/70 dark:bg-white/70 group-hover:bg-slate-800 dark:group-hover:bg-white rounded-full transform transition-all duration-300 ease-in-out ${
              isMobileMenuOpen
                ? 'rotate-45 translate-y-2'
                : ''
            }`}
          />
          {/* 中の線 */}
          <span
            className={`block w-6 h-0.5 bg-slate-600/70 dark:bg-white/70 group-hover:bg-slate-800 dark:group-hover:bg-white rounded-full transform transition-all duration-300 ease-in-out my-1.5 ${
              isMobileMenuOpen
                ? 'opacity-0 scale-0'
                : ''
            }`}
          />
          {/* 下の線 */}
          <span
            className={`block w-6 h-0.5 bg-slate-600/70 dark:bg-white/70 group-hover:bg-slate-800 dark:group-hover:bg-white rounded-full transform transition-all duration-300 ease-in-out ${
              isMobileMenuOpen
                ? '-rotate-45 -translate-y-2'
                : ''
            }`}
          />
        </div>
      </button>

      {/* モバイルメニュー */}
      <nav className={`lg:hidden fixed inset-0 z-2 bg-white/95 dark:bg-black/90 backdrop-blur-sm transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}
      >
        <div className="flex flex-col justify-center items-center h-full space-y-8 text-2xl">
          <div
            className="space-y-6 mobile-nav-container"
            data-current-path={pathname || ''}
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
