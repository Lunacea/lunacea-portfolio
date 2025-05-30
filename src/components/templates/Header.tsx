'use client';

import { LocaleSwitcher } from '@/components/core/LocaleSwitcher';

export type HeaderProps = {
  rightNav?: React.ReactNode;
};

export const Header = ({ rightNav }: HeaderProps) => {
  return (
    <header className="absolute top-6 right-6 z-99">
      <nav className="flex items-center gap-4">
        {rightNav}
        <LocaleSwitcher />
      </nav>
    </header>
  );
};
