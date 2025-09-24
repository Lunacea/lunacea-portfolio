import { supabase } from './supabase'

export interface User {
  id: string
  email?: string
  name?: string
  avatarUrl?: string
}

export interface Session {
  user: User
  expiresAt: Date
}

export interface AuthProvider {
  signIn(): Promise<void>
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
  getSession(): Promise<Session | null>
}

export class SupabaseAuthProvider implements AuthProvider {
  async signIn(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/api/v1/auth/callback`
      }
    })

    if (error) {
      throw new Error(`Supabase sign in failed: ${error.message}`)
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`Supabase sign out failed: ${error.message}`)
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) return null

      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatarUrl: user.user_metadata?.avatar_url
      }
    } catch (error) {
      console.error('Supabase auth error:', error)
      return null
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) return null

      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name,
          avatarUrl: session.user.user_metadata?.avatar_url
        },
        expiresAt: new Date((session.expires_at ?? 0) * 1000)
      }
    } catch (error) {
      console.error('Supabase session error:', error)
      return null
    }
  }
}

// Supabase Authのみを使用
export const authProvider: AuthProvider = new SupabaseAuthProvider()
