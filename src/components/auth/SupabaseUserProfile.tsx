'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/libs/supabase'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

interface UserProfile {
  id: string
  email?: string
  name?: string
  avatarUrl?: string
}

export function SupabaseUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('Error getting user:', error)
          return
        }

        if (user) {
          setUser({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            avatarUrl: user.user_metadata?.avatar_url
          })
        }
    } catch {
      console.error('Error getting user')
    } finally {
      setLoading(false)
    }
  }

  getUser()
}, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError(null)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const name = formData.get('name') as string

      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      })

      if (error) {
        setError(error.message)
      } else {
        setUser(prev => prev ? { ...prev, name } : null)
      }
    } catch {
      setError('プロフィールの更新中にエラーが発生しました')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">読み込み中...</div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">ユーザー情報を取得できませんでした</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>プロフィール</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.avatarUrl && (
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl}
              alt="プロフィール画像"
              className="w-20 h-20 rounded-full"
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            type="email"
            value={user.email || ''}
            disabled
            className="bg-gray-100"
          />
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <Label htmlFor="name">名前</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={user.name || ''}
              placeholder="名前を入力してください"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <Button
            type="submit"
            disabled={updating}
            className="w-full"
          >
            {updating ? '更新中...' : 'プロフィールを更新'}
          </Button>
        </form>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
            className="w-full"
          >
            サインアウト
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
