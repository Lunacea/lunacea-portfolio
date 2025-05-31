'use client';

export type HeaderProps = {
  rightNav?: React.ReactNode;
};

export const Header = ({ rightNav }: HeaderProps) => {
  // rightNavがない場合は何も表示しない
  if (!rightNav) {
    return null;
  }

  return (
    <header className="absolute top-6 right-20 z-99">
      <nav className="flex items-center gap-3">
        {rightNav}
      </nav>
    </header>
  );
};
