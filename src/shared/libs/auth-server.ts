import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  avatarUrl?: string
}

/**
 * サーバーサイドでSupabase Authのユーザー情報を取得
 * Clerkのauth()の代替
 */
export async function auth(): Promise<{ userId: string | null }> {
  // 環境変数で明示的に許可されている場合のみ、開発環境バイパスを有効化
  if (process.env.BYPASS_AUTH === 'true') {
    console.warn('⚠️  Authentication bypass is enabled (BYPASS_AUTH=true)')
    return { userId: 'dev-user-123' }
  }

  try {
    const cookieStore = await cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return { userId: null }
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // getUser() を使用してサーバー側で認証を検証（セキュリティ推奨）
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error:', error.message)
      return { userId: null }
    }

    if (!user) {
      return { userId: null }
    }

    return { userId: user.id }
  } catch (error) {
    console.error('Auth error:', error)
    return { userId: null }
  }
}

/**
 * サーバーサイドでSupabase Authのユーザー情報を取得（詳細版）
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return null
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
    
    // getUser() を使用してサーバー側で認証を検証（セキュリティ推奨）
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Get user error:', error.message)
      return null
    }

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatarUrl: user.user_metadata?.avatar_url
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}
