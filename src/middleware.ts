import { NextResponse, type NextRequest } from 'next/server';
import { detectBot } from '@arcjet/next';
import createMiddleware from 'next-intl/middleware';
import arcjet from '@/shared/libs/Arcjet';
import { routing } from '@/shared/libs/i18nRouting';
import { createServerClient } from '@supabase/ssr';

const handleI18nRouting = createMiddleware(routing);

// 保護対象ルートの判定
const isProtectedRoute = (pathname: string): boolean => {
  // 認証不要のパスを除外
  const publicPatterns = [
    /^\/api\/auth\/callback$/,  // OAuth callback
    /^\/[a-z]{2}\/api\/auth\/callback$/,  // ロケール付きcallback
  ];
  
  if (publicPatterns.some((re) => re.test(pathname))) {
    return false;
  }
  
  // /dashboard または /{locale}/dashboard を対象
  const protectedPatterns = [
    /^\/dashboard(\/.+)?$/,
    /^\/[a-z]{2}\/dashboard(\/.+)?$/,
  ];
  return protectedPatterns.some((re) => re.test(pathname));
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

  // i18nのレスポンスを先に生成
  const response = handleI18nRouting(request);

  // 未認証で保護ルートに来たらサインインへ（元URLを持たせる）
  const pathname = request.nextUrl.pathname;
  if (isProtectedRoute(pathname)) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] ?? '';
        const signInUrl = new URL(`${locale ? `/${locale}` : ''}/sign-in`, request.url);
        signInUrl.searchParams.set('redirect_to', pathname + request.nextUrl.search);
        return NextResponse.redirect(signInUrl);
      }
    } catch {
      // セッション更新に失敗した場合も安全側でサインインへ
      const locale = pathname.match(/^\/([a-z]{2})\//)?.[1] ?? '';
      const signInUrl = new URL(`${locale ? `/${locale}` : ''}/sign-in`, request.url);
      signInUrl.searchParams.set('redirect_to', pathname + request.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }
  }

  // i18nルーティングを実行したレスポンスを返す（Cookieも反映済み）
  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|monitoring|.*\\..*).*)',
};
