'use client';

import { useTheme } from 'next-themes';
import { useCallback } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import Icon from '@/shared/components/ui/Icon';

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();

  const handleToggle = useCallback(() => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, [resolvedTheme, setTheme]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLButtonElement>) => {
    const text = (e.currentTarget.getAttribute('data-drag-text') ?? 'C');
    e.dataTransfer.setData('text/plain', text);
  }, []);

  return (
    <button
      type="button"
      onClick={handleToggle}
      onDragStart={handleDragStart}
      draggable
      className={`${className} theme-toggle-button cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95 opacity-100`}
      aria-label="テーマを切り替え"
      title="ドラッグして 'C' をコピー、クリックでテーマ切り替え"
      data-drag-text="C"
    >
      <Icon
        icon={<FaSun />}
        className={`sun-icon 
          mx-1 text-[0.85em] w-[0.85em] h-[0.85em] align-baseline
          transition-all duration-500
          text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] hover:rotate-[20deg] hover:text-amber-400
        `}
      />
      <Icon
        icon={<FaMoon />}
        className={`moon-icon 
          mx-1 text-[0.85em] w-[0.85em] h-[0.85em] align-baseline
          transition-all duration-500
          text-amber-200 drop-shadow-[0_0_8px_rgba(254,243,199,0.6)] hover:drop-shadow-[0_0_20px_rgba(254,243,199,0.8)] hover:rotate-[-15deg] hover:text-amber-100
        `}
      />
    </button>
  );
}
