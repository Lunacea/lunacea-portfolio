'use client'

import { useState, useEffect } from 'react'
import { getOAuthDebugInfo, validateOAuthConfig } from '@/shared/utils/oauthDebug'

export default function OAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<{
    supabaseUrl: string | undefined
    supabaseAnonKey: string | undefined
    githubClientId: string | undefined
    githubClientSecret: string | undefined
    redirectUrl: string
    expectedCallbackUrl: string
  }>({
    supabaseUrl: undefined,
    supabaseAnonKey: undefined,
    githubClientId: undefined,
    githubClientSecret: undefined,
    redirectUrl: '',
    expectedCallbackUrl: ''
  })
  const [configValidation, setConfigValidation] = useState({
    isValid: false,
    errors: ['読み込み中...']
  })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // クライアントサイドでのみ実行
    setDebugInfo(getOAuthDebugInfo())
    setConfigValidation(validateOAuthConfig())
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            OAuth設定診断
          </h1>
          
          <div className="space-y-6">
            {/* 設定検証結果 */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                設定検証結果
              </h2>
              {!isLoaded ? (
                <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-700">
                  <p className="font-medium text-gray-600 dark:text-gray-400">
                    読み込み中...
                  </p>
                </div>
              ) : (
                <div className={`p-3 rounded-md ${configValidation.isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <p className={`font-medium ${configValidation.isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {configValidation.isValid ? '✓ 設定は正常です' : '✗ 設定に問題があります'}
                  </p>
                  {configValidation.errors.length > 0 && (
                    <ul className="mt-2 list-disc list-inside text-sm text-red-600 dark:text-red-400">
                      {configValidation.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 環境変数情報 */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                環境変数情報
              </h2>
              {!isLoaded ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">読み込み中...</span>
                    <span className="text-gray-400">-</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Supabase URL:</span>
                    <span className={`font-mono text-sm ${debugInfo.supabaseUrl ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {debugInfo.supabaseUrl ? '✓ 設定済み' : '✗ 未設定'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Supabase Anon Key:</span>
                    <span className={`font-mono text-sm ${debugInfo.supabaseAnonKey ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {debugInfo.supabaseAnonKey ? '✓ 設定済み' : '✗ 未設定'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">GitHub Client ID:</span>
                    <span className={`font-mono text-sm ${debugInfo.githubClientId ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {debugInfo.githubClientId ? '✓ 設定済み' : '✗ 未設定'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">GitHub Client Secret:</span>
                    <span className={`font-mono text-sm ${debugInfo.githubClientSecret ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {debugInfo.githubClientSecret ? '✓ 設定済み' : '✗ 未設定'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* URL情報 */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                URL情報
              </h2>
              {!isLoaded ? (
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">読み込み中...</span>
                    <p className="font-mono text-sm text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                      -
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">リダイレクトURL:</span>
                    <p className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                      {debugInfo.redirectUrl}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">期待されるコールバックURL:</span>
                    <p className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                      {debugInfo.expectedCallbackUrl}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 設定手順 */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                設定手順
              </h2>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">1. GitHub OAuth Appの設定</h3>
                  <p>GitHub Settings → Developer settings → OAuth Apps で以下を設定:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Authorization callback URL: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">http://localhost:3000/api/v1/auth/callback</code></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">2. Supabase Dashboardの設定</h3>
                  <p>Authentication → Providers → GitHub で以下を設定:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Client ID: GitHub OAuth Appから取得</li>
                    <li>Client Secret: GitHub OAuth Appから取得</li>
                    <li>Redirect URL: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">http://localhost:3000/api/v1/auth/callback</code></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">3. Supabase URL Configuration</h3>
                  <p>Authentication → URL Configuration で以下を設定:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Site URL: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">http://localhost:3000</code></li>
                    <li>Redirect URLs: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">http://localhost:3000/api/v1/auth/callback</code> を追加</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">4. 環境変数の設定</h3>
                  <p>.env.localファイルに以下を追加:</p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
