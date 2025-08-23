import type { NextFetchEvent, NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import arcjet from '@/shared/libs/Arcjet';
import { routing } from '@/shared/libs/i18nRouting';

const handleI18nRouting = createMiddleware(routing);

// Remove Clerk route matchers. Admin is protected via Cloudflare Access.

// Improve security with Arcjet
const aj = arcjet.withRule(
  detectBot({
    mode: 'LIVE',
    // Block all bots except the following
    allow: [
      // See https://docs.arcjet.com/bot-protection/identifying-bots
      'CATEGORY:SEARCH_ENGINE', // Allow search engines
      'CATEGORY:PREVIEW', // Allow preview links to show OG images
      'CATEGORY:MONITOR', // Allow uptime monitoring services
    ],
  }),
);

export default async function middleware(
  request: NextRequest,
  _event: NextFetchEvent,
) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Cloudflare Access JWT required for /admin
  const p = request.nextUrl.pathname;
  const isAdmin = /^\/[a-z]{2}(?:-[A-Z]{2})?\/admin(?:\/.*)?$/.test(p) || /^\/admin(?:\/.*)?$/.test(p);
  if (isAdmin) {
    const cfJwt = request.headers.get('Cf-Access-Jwt-Assertion');
    if (!cfJwt) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // 最小範囲に限定: ルートのロケール判定と管理画面のみ
  matcher: ['/', '/admin/:path*', '/:locale/admin/:path*'],
};
