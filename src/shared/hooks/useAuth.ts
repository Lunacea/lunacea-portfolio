'use client'

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/shared/libs/supabase-browser'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // 環境変数で明示的に許可されている場合のみ、認証バイパスを有効化
    if (process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true') {
      console.warn('⚠️  Authentication bypass is enabled (NEXT_PUBLIC_BYPASS_AUTH=true)')
      setAuthState({
        user: {
          id: 'dev-user-123',
          email: 'dev@example.com',
          user_metadata: {
            full_name: 'Development User',
            avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4'
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User,
        session: null,
        loading: false,
        error: null
      })
      return
    }

    // 初期セッションを取得
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
          return
        }

        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false
        }))
      } catch (err) {
        console.error('Unexpected error getting session:', err)
        setAuthState(prev => ({ 
          ...prev, 
          error: 'セッションの取得中にエラーが発生しました', 
          loading: false 
        }))
      }
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.warn('Auth state changed:', event, session?.user?.id)
        
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session,
          loading: false,
          error: null
        }))
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGitHub = async (nextUrl = '/dashboard') => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          // OAuth完了後、/api/auth/callback にリダイレクトされ、そこからnextで指定した場所へ
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`
        }
      })

      if (error) {
        console.error('OAuth sign in error:', error)
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { success: false, error: error.message }
      }

      if (data.url) {
        // リダイレクトが発生する
        window.location.href = data.url
        return { success: true }
      } else {
        setAuthState(prev => ({ ...prev, error: 'リダイレクトURLが取得できませんでした', loading: false }))
        return { success: false, error: 'リダイレクトURLが取得できませんでした' }
      }
    } catch (err) {
      console.error('Sign in error:', err)
      const errorMessage = 'サインイン中にエラーが発生しました'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { success: false, error: error.message }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { success: true }
    } catch (err) {
      console.error('Sign out error:', err)
      const errorMessage = 'サインアウト中にエラーが発生しました'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { success: false, error: errorMessage }
    }
  }

  return {
    ...authState,
    signInWithGitHub,
    signOut
  }
}
