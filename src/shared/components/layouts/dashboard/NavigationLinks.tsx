'use client';

import { Link, usePathname } from '@/shared/libs/i18nNavigation';

type NavItem = { href: string; label: string };

export type NavigationLinksProps = { className?: string };

export default function NavigationLinks({ className = '' }: NavigationLinksProps = {}) {
  const pathname = usePathname();

  const isActivePath = (href: string) => {
    const pathSegments = pathname?.split('/').filter(Boolean) || [];
    let basePath = '/dashboard';
    if (pathSegments.length > 0) {
      if (pathSegments[0]?.length === 2 && !pathSegments[0].includes('.')) {
        const remaining = pathSegments.slice(1);
        if (remaining.length > 0) {
          basePath = `/${remaining.join('/')}`;
        }
      } else {
        basePath = `/${pathSegments.join('/')}`;
      }
    }
    const normalize = (p: string) => {
      const trimmed = p.replace(/\/$/, '');
      return trimmed === '' ? '/dashboard' : trimmed;
    };
    const normalizedBase = normalize(basePath);
    const normalizedHref = normalize(href);
    if (normalizedHref === '/dashboard') {
      return normalizedBase === '/dashboard';
    }
    return normalizedBase === normalizedHref || normalizedBase.startsWith(`${normalizedHref}/`);
  };

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/blog', label: 'Blog' },
    { href: '/dashboard/works', label: 'Works' },
    { href: '/dashboard/profile', label: 'Profile' },
  ];

  return (
    <div
      className={`space-y-6 [&_.nav-link]:transition-all [&_.nav-link]:duration-200 [&_.nav-link]:ease-linear [&_.nav-link:hover:not(.active-nav-link)]:translate-x-1 [&_.active-nav-link]:text-primary [&_.active-nav-link]:font-semibold  [&_.active-nav-link]:relative [&_.active-nav-link]:pointer-events-none [&_.active-nav-link]:cursor-default [&_.active-nav-link]:before:content-[''] [&_.active-nav-link]:before:absolute [&_.active-nav-link]:before:-left-0.5 [&_.active-nav-link]:before:top-1/2 [&_.active-nav-link]:before:-translate-y-1/2 [&_.active-nav-link]:before:w-0.5 [&_.active-nav-link]:before:h-3/5 [&_.active-nav-link]:before:bg-primary [&_.active-nav-link]:before:rounded-r-sm ${className}`}
    >
      <ul className="space-y-4 text-xl">
        {navItems.map(item => (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              className={`nav-link group relative text-lg font-medium inline-block py-3 px-4 rounded-lg ${
                isActivePath(item.href) ? 'active-nav-link' : 'text-theme-secondary hover:text-foreground'
              }`}
              {...(isActivePath(item.href) ? { 'aria-current': 'page' } : {})}
            >
              {!isActivePath(item.href) && (
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              )}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
