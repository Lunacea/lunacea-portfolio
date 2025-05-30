'use client';

import { LocaleSwitcher } from '@/components/core/LocaleSwitcher';

export type HeaderProps = {
  rightNav?: React.ReactNode;
};

export const Header = ({ rightNav }: HeaderProps) => {
  return (
    <header className="absolute top-6 right-6 z-99">
      <nav className="flex items-center gap-3">
        {rightNav}
        <div className="p-3 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 rounded-lg">
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
};
