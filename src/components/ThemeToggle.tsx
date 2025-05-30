'use client';

import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
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

  if (!mounted) {
    // サーバーサイドレンダリング時は月アイコンを表示（デフォルト）
    return (
      <Icon
        icon={faMoon}
        className={`${className} opacity-50 text-amber-200 mx-1 text-[0.85em] w-[0.85em] h-[0.85em] align-baseline`}
      />
    );
  }

  const handleToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={handleToggle}
      className={`${className} cursor-pointer transition-all duration-300`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <Icon
        icon={isDark ? faSun : faMoon}
        className={`
          mx-1 text-[0.85em] w-[0.85em] h-[0.85em] align-baseline
          transition-all duration-300
          ${isDark
      ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] hover:rotate-[15deg]'
      : 'text-amber-200 drop-shadow-[0_0_8px_rgba(254,243,199,0.4)] hover:drop-shadow-[0_0_15px_rgba(254,243,199,0.6)]'
    }
        `}
      />
    </button>
  );
}
