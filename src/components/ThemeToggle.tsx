'use client';

import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/Icon';

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // ハイドレーションエラーを避けるため、クライアントサイドでのマウント後にのみレンダリング
  useEffect(() => {
    setMounted(true);
  }, []);

  // ドラッグ開始時の処理
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', 'C');
    e.dataTransfer.effectAllowed = 'copy';

    // カスタムドラッグイメージを設定（オプション）
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.opacity = '0.8';
    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 10, 10);

    // クリーンアップ
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
  }, []);

  if (!mounted) {
    // サーバーサイドレンダリング時は太陽アイコンを表示（ライトモードデフォルト）
    return (
      <Icon
        icon={faSun}
        className={`${className} opacity-50 text-amber-500 dark:text-amber-200 mx-1 text-[0.85em] w-[0.85em] h-[0.85em] align-baseline`}
      />
    );
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={handleToggle}
      onDragStart={handleDragStart}
      draggable={true}
      className={`${className} cursor-pointer transition-all duration-500 hover:scale-110 active:scale-95`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title="ドラッグして 'C' をコピー、クリックでテーマ切り替え"
      data-drag-text="C"
    >
      <Icon
        icon={isDark ? faMoon : faSun}
        className={`
          mx-1 text-[0.85em] w-[0.85em] h-[0.85em] align-baseline
          transition-all duration-500
          ${isDark
      ? 'text-amber-200 drop-shadow-[0_0_8px_rgba(254,243,199,0.6)] hover:drop-shadow-[0_0_20px_rgba(254,243,199,0.8)] hover:rotate-[-15deg] hover:text-amber-100'
      : 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] hover:rotate-[20deg] hover:text-amber-400'
    }
        `}
      />
    </button>
  );
}
