'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BaseTemplate } from '@/components/templates/BaseTemplate';

/**
 * マーケティングセクションのレイアウトコンポーネント
 * バックグラウンドエフェクトと色調整機能を提供します
 */
export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const pathname = usePathname();

  // 現在のパスがアクティブかどうか判定
  const isActivePath = (href: string) => {
    const normalizedPathname = pathname?.replace(/\/$/, '') || '';
    const normalizedHref = href.replace(/\/$/, '');
    return normalizedPathname === normalizedHref
      || (normalizedHref !== '' && normalizedPathname.startsWith(normalizedHref));
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

  return (
    <>
      {/* カスタムスタイル */}
      <style jsx global>
        {`
        .active-nav-highlight::before {
          content: '';
          position: absolute;
          left: -4px; /* リンクの少し左に配置 */
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%; /* リンクの高さの60% */
          background-color: var(--primary);
          border-radius: 0 2px 2px 0;
        }
      `}
      </style>

      {/* メインコンテンツ */}
      <div className="relative">
        <BaseTemplate
          leftNav={(
            <ul className="space-y-4 text-xl">
              <li className="relative">
                <Link
                  href="/profile"
                  className={`${getActiveLinkStyle('/profile')} ${isActivePath('/profile') ? 'active-nav-highlight' : ''}`}
                  {...(isActivePath('/profile') ? { 'aria-current': 'page' } : {})}
                >
                  {!isActivePath('/profile') && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
                  )}
                  Profile
                </Link>
              </li>
              <li className="relative">
                <Link
                  href="/works"
                  className={`${getActiveLinkStyle('/works')} ${isActivePath('/works') ? 'active-nav-highlight' : ''}`}
                  {...(isActivePath('/works') ? { 'aria-current': 'page' } : {})}
                >
                  {!isActivePath('/works') && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
                  )}
                  Works
                </Link>
              </li>
              <li className="relative">
                <Link
                  href="/blog"
                  className={`${getActiveLinkStyle('/blog')} ${isActivePath('/blog') ? 'active-nav-highlight' : ''}`}
                  {...(isActivePath('/blog') ? { 'aria-current': 'page' } : {})}
                >
                  {!isActivePath('/blog') && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300"></span>
                  )}
                  Blog
                </Link>
              </li>
            </ul>
          )}
        >
          {props.children}
        </BaseTemplate>
      </div>
    </>
  );
}
