'use client';

import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { Icon } from '@/components/Icon';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // フックの定義を先に行う
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'C');
    e.dataTransfer.effectAllowed = 'copy';
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.opacity = '0.8';
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 10, 10);
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  }, []);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // theme が undefined の可能性を考慮 (マウント直後など)
    if (theme) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme, setTheme]);

  // マウントされるまでは何もレンダリングしない
  if (!mounted) {
    // オプション: スケルトンや最小限のプレースホルダーを返すことも可能
    // ただし、ハイドレーションミスマッチを避けるため、SSR時には存在しないものとして扱う
    // ここでは null を返して完全にクライアントサイドでのみ描画する
    return null;
  }

  // 以降はマウントされた後のみ実行されるロジック
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={handleToggle}
      onDragStart={handleDragStart}
      draggable={true}
      className={`${className} cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 opacity-100`} // 最初から表示
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title="ドラッグして 'C' をコピー、クリックでテーマ切り替え"
      data-drag-text="C"
    >
      <Icon
        icon={isDark ? <FaMoon /> : <FaSun />}
        className={`
          mx-1 text-[0.85em] w-[0.85em] h-[0.85em] align-baseline
          transition-all duration-500 
          ${isDark // マウント後なので mounted のチェックは不要
      ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(254,243,199,0.6)] hover:drop-shadow-[0_0_20px_rgba(254,243,199,0.8)] hover:rotate-[-15deg] hover:text-amber-100'
      : 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] hover:rotate-[20deg] hover:text-amber-400'
    }
        `}
      />
    </button>
  );
}
