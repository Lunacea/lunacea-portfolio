'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ナビゲーションアイテムの型定義
type NavItem = {
  href: string;
  label: string;
};

export function ClientNavigation() {
  const pathname = usePathname();

  // 現在のパスがアクティブかどうか判定
  const isActivePath = (href: string) => {
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    let pathWithoutLocale = '';
    if (pathSegments.length > 1 && pathSegments[0]?.length === 2) {
      pathWithoutLocale = `/${pathSegments.slice(1).join('/')}`;
    } else if (pathSegments.length > 0) {
      pathWithoutLocale = `/${pathSegments.join('/')}`;
    }
    const normalizedPathWithoutLocale = pathWithoutLocale.replace(/\/$/, '') || '';
    const normalizedHref = href.replace(/\/$/, '');

    return normalizedPathWithoutLocale === normalizedHref
      || (normalizedHref !== '' && normalizedPathWithoutLocale.startsWith(normalizedHref));
  };

  // アクティブリンクのスタイル
  const getActiveLinkStyle = (href: string) => {
    const isActive = isActivePath(href);
    return `group relative transition-all duration-300 text-lg font-medium inline-block py-3 px-4 rounded-lg ${
      isActive
        ? 'text-primary font-semibold cursor-default pointer-events-none'
        : 'text-theme-secondary'
    }`;
  };

  // ナビゲーションアイテムのデータ
  const navItems: NavItem[] = [
    { href: '/profile', label: 'Profile' },
    { href: '/works', label: 'Works' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <ul className="space-y-4 text-xl">
      {navItems.map(item => (
        <li key={item.href} className="relative">
          <Link
            href={item.href} // Link の href はロケールなしのまま
            className={`${getActiveLinkStyle(item.href)} ${isActivePath(item.href) ? 'active-nav-highlight' : ''}`}
            {...(isActivePath(item.href) ? { 'aria-current': 'page' } : {})}
          >
            {!isActivePath(item.href) && (
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
            )}
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
