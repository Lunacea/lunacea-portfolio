'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useAuth } from '@/shared/hooks/useAuth'
import { supabase } from '@/shared/libs/supabase-browser'

export function SupabaseSignIn() {
  const [error, setError] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const locale = useLocale()

  // URLパラメータからエラーメッセージを取得（redirect_toは保持）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get('error')
    
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      // URLからエラーパラメータを削除
      const clean = new URL(window.location.href)
      clean.searchParams.delete('error')
      const cleanUrl = clean.origin + clean.pathname + (clean.search ? `?${clean.searchParams.toString()}` : '')
      window.history.replaceState({}, document.title, cleanUrl)
    }

    // redirect_toはそのまま残す（GitHub OAuth開始時に利用）
  }, [])

  // 既にログインしている場合はダッシュボードにリダイレクト
  // 自動リダイレクトは行わない（UX簡素化）
  useEffect(() => {
    // no-op
  }, [user, authLoading, locale])

  const handleGitHubSignIn = async () => {
    setError(null)
    
    try {
      // SupabaseのGitHub OAuth認証を実行
      const urlParams = new URLSearchParams(window.location.search)
      const redirectToParam = urlParams.get('redirect_to')
      const nextUrl = redirectToParam || `/${locale}/dashboard`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          // OAuth完了後、/api/auth/callback にリダイレクトされ、そこからnextで指定した場所へ
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(nextUrl)}`
        }
      })

      if (error) {
        console.error('OAuth sign in error:', error)
        setError('サインイン中にエラーが発生しました')
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Sign in error:', err)
      setError('サインイン中にエラーが発生しました')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            サインイン
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            アカウントにサインインしてください
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleGitHubSignIn}
            disabled={authLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {authLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                サインイン中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                GitHubでサインイン
              </>
            )}
          </button>


        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            サインインすることで、
            <span className="text-indigo-600 dark:text-indigo-400">
              プライバシーポリシー
            </span>
            および
            <span className="text-indigo-600 dark:text-indigo-400">
              利用規約
            </span>
            に同意したものとみなされます。
          </p>
        </div>
      </div>
    </div>
  )
}
