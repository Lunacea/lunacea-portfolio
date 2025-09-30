'use client'

import { supabase } from '@/shared/libs/supabase-browser'
import { useRouter } from 'next/navigation'

interface SupabaseSignOutButtonProps {
  children: React.ReactNode
}

export function SupabaseSignOutButton({ children }: SupabaseSignOutButtonProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <button onClick={handleSignOut} type="button">
      {children}
    </button>
  )
}
