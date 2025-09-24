/**
 * OAuth認証フローのデバッグ用ユーティリティ
 */

export interface OAuthDebugInfo {
  supabaseUrl: string | undefined
  supabaseAnonKey: string | undefined
  githubClientId: string | undefined
  githubClientSecret: string | undefined
  redirectUrl: string
  expectedCallbackUrl: string
}

export function getOAuthDebugInfo(): OAuthDebugInfo {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  
  // デバッグ用：環境変数の詳細をログ出力
  console.warn('Environment variables debug:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'Set' : 'Not set',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET ? 'Set' : 'Not set',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('GITHUB') || key.includes('SUPABASE'))
  })
  
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : undefined,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? 'Set' : undefined,
    redirectUrl: `${baseUrl}/api/v1/auth/callback`,
    expectedCallbackUrl: `${baseUrl}/api/v1/auth/callback`
  }
}

export function logOAuthDebugInfo(): void {
  const debugInfo = getOAuthDebugInfo()
  
  console.warn('=== OAuth Debug Information ===')
  console.warn('Supabase URL:', debugInfo.supabaseUrl)
  console.warn('Supabase Anon Key:', debugInfo.supabaseAnonKey)
  console.warn('GitHub Client ID:', debugInfo.githubClientId)
  console.warn('GitHub Client Secret:', debugInfo.githubClientSecret)
  console.warn('Redirect URL:', debugInfo.redirectUrl)
  console.warn('Expected Callback URL:', debugInfo.expectedCallbackUrl)
  console.warn('================================')
}

export function validateOAuthConfig(): { isValid: boolean; errors: string[] } {
  const debugInfo = getOAuthDebugInfo()
  const errors: string[] = []
  
  if (!debugInfo.supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
  }
  
  if (!debugInfo.supabaseAnonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  }
  
  if (!debugInfo.githubClientId) {
    errors.push('GITHUB_CLIENT_ID is not set')
  }
  
  if (!debugInfo.githubClientSecret) {
    errors.push('GITHUB_CLIENT_SECRET is not set')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
