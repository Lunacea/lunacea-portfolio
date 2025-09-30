import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'

/**
 * Supabase OAuth callback handler
 * GitHub認証などのOAuthフロー完了後にSupabaseからリダイレクトされるエンドポイント
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  // エラーパラメータがある場合は、サインインページにリダイレクト
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    const locale = next.split('/')[1] || 'ja'
    return NextResponse.redirect(
      new URL(
        `/${locale}/sign-in?error=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin
      )
    )
  }

  // code がない場合もエラー
  if (!code) {
    console.error('No code provided in OAuth callback')
    return NextResponse.redirect(
      new URL('/sign-in?error=no_code', requestUrl.origin)
    )
  }

  // Supabase クライアントを作成（Cookie管理を含む）
  const response = NextResponse.redirect(new URL(next, requestUrl.origin))
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return NextResponse.redirect(
      new URL('/sign-in?error=server_config', requestUrl.origin)
    )
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 認証コードをセッションに交換
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('Error exchanging code for session:', exchangeError)
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${encodeURIComponent(exchangeError.message)}`,
        requestUrl.origin
      )
    )
  }

  if (!data.session) {
    console.error('No session created after code exchange')
    return NextResponse.redirect(
      new URL('/sign-in?error=no_session', requestUrl.origin)
    )
  }

  // デバッグ用（本番環境では削除推奨）
  if (process.env.NODE_ENV === 'development') {
    console.warn('OAuth callback successful, user:', data.user.email)
  }
  
  // 成功したらnextパラメータで指定された場所にリダイレクト
  return response
}
