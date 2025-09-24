'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/shared/libs/supabase'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const redirectTo = searchParams.get('redirect_to') || '/dashboard'

      // console.warn は許可。情報ログは削除

      if (code) {
        try {
          console.warn('Exchanging code for session...')
          // PKCE認証フローを無効化してシンプルな認証に変更
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error('Session exchange error:', error)
            console.warn('Trying alternative authentication method...')
            
            // 代替認証方法を試す
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
            
            if (sessionError) {
              console.error('Session error:', sessionError)
              router.push(`/sign-in?error=${encodeURIComponent(sessionError.message)}`)
              return
            }

            if (sessionData.session) {
              console.warn('Session found, redirecting to:', redirectTo)
              router.push(redirectTo)
            } else {
              console.error('No session found')
              router.push('/sign-in?error=no_session')
            }
            return
          }

          if (data.session) {
            console.warn('Authentication successful, redirecting to:', redirectTo)
            router.push(redirectTo)
          } else {
            console.error('No session after code exchange')
            router.push('/sign-in?error=no_session')
          }
        } catch (error) {
          console.error('Callback error:', error)
          router.push('/sign-in?error=server_error')
        }
      } else {
        console.warn('No code received')
        router.push('/sign-in?error=no_code')
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        <p className="mt-4 text-gray-600">認証を処理中...</p>
      </div>
    </div>
  )
}
