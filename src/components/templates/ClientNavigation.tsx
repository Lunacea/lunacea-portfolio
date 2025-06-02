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
    // 1. パス名からロケールプレフィックスを除去し、ベースパスを取得
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    let basePath = '/'; // デフォルトはルートパス

    if (pathSegments.length > 0) {
      // 最初のセグメントが2文字のロケールコード（例: "en", "ja"）であるか確認
      // ".." のような相対パスセグメントはロケールと見なさない
      if (pathSegments[0]?.length === 2 && !pathSegments[0].includes('.')) {
        // ロケールを除いた残りのセグメントでパスを再構築
        const remainingSegments = pathSegments.slice(1);
        if (remainingSegments.length > 0) {
          basePath = `/${remainingSegments.join('/')}`;
        } // remainingSegmentsが空の場合、basePathは '/' のまま (例: /en -> /)
      } else {
        // ロケールプレフィックスがない場合、または最初のセグメントがロケールではない場合
        basePath = `/${pathSegments.join('/')}`;
      }
    }

    // 2. ベースパスとhrefを正規化
    // 末尾のスラッシュを除去し、空文字列になった場合は '/' とする
    const normalizePath = (p: string) => {
      const trimmed = p.replace(/\/$/, '');
      return trimmed === '' ? '/' : trimmed;
    };

    const normalizedBasePath = normalizePath(basePath);
    const normalizedHref = normalizePath(href);

    // 3. 比較ロジック
    if (normalizedHref === '/') { // Home リンクの場合
      return normalizedBasePath === '/';
    }
    // その他のリンクの場合：完全一致、またはサブパスとして一致
    return normalizedBasePath === normalizedHref || normalizedBasePath.startsWith(`${normalizedHref}/`);
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
    { href: '/', label: 'Home' },
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
