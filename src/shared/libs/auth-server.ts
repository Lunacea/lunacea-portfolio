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
  // 開発環境では常に認証済みとして扱う
  if (process.env.NODE_ENV === 'development') {
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
    
    // クッキーからセッションを取得
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error:', error)
      return { userId: null }
    }

    if (!session) {
      console.warn('No session found')
      return { userId: null }
    }

    return { userId: session.user.id }
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
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error:', error)
      return null
    }

    if (!session) {
      console.warn('No session found')
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
      avatarUrl: session.user.user_metadata?.avatar_url
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}
