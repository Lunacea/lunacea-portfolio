import { NextResponse, type NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import createMiddleware from 'next-intl/middleware';
import arcjet from '@/shared/libs/Arcjet';
import { routing } from '@/shared/libs/i18nRouting';
import { createServerClient } from '@supabase/ssr';

const handleI18nRouting = createMiddleware(routing);

// 保護されたルートのパターン
const isProtectedRoute = (pathname: string): boolean => {
  const protectedPatterns = [
    /^\/dashboard/,
    /^\/[a-z]{2}\/dashboard/,
  ];
  
  return protectedPatterns.some(pattern => pattern.test(pathname));
};

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
) {
  // Verify the request with Arcjet
  // Use `process.env` instead of Env to reduce bundle size in middleware
  if (process.env.ARCJET_KEY) {
    const decision = await aj.protect(request);

    if (decision.isDenied()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const pathname = request.nextUrl.pathname;

    // 開発環境では認証を完全にスキップ
    if (process.env.NODE_ENV === 'development') {
      return handleI18nRouting(request)
    }

    // 本番環境: 保護されたルートでSupabase認証をチェック
    if (isProtectedRoute(pathname)) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables')
          return handleI18nRouting(request)
        }

        const supabase = createServerClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll()
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              },
            },
          }
        )

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] ?? '';
          const signInUrl = new URL(`${locale ? `/${locale}` : ''}/sign-in`, request.url);
          return NextResponse.redirect(signInUrl);
        }
      } catch {
        console.error('Supabase middleware error');
      }
    }

  // i18nルーティングを実行
  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|monitoring|.*\\..*).*)',
};
