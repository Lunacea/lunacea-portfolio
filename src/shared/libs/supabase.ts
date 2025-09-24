import { createClient } from '@supabase/supabase-js'

// クライアントサイド用（RLS適用）
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    }
  }
)

// 型定義
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'admin' | 'editor' | 'author' | 'reader'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'admin' | 'editor' | 'author' | 'reader'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'admin' | 'editor' | 'author' | 'reader'
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: number
          slug: string
          title: string
          description: string | null
          content: string
          content_html: string | null
          excerpt: string
          tags: string[]
          published_at: string | null
          updated_at: string
          created_at: string
          status: 'draft' | 'published'
          is_published: boolean
          reading_time: number
          view_count: number
          cover_image: string | null
          og_image: string | null
          author_id: string
          meta_title: string
          meta_description: string | null
        }
        Insert: {
          id?: number
          slug: string
          title: string
          description?: string | null
          content: string
          content_html?: string | null
          excerpt: string
          tags: string[]
          published_at?: string | null
          updated_at?: string
          created_at?: string
          status: 'draft' | 'published'
          is_published: boolean
          reading_time: number
          view_count?: number
          cover_image?: string | null
          og_image?: string | null
          author_id: string
          meta_title: string
          meta_description?: string | null
        }
        Update: {
          id?: number
          slug?: string
          title?: string
          description?: string | null
          content?: string
          content_html?: string | null
          excerpt?: string
          tags?: string[]
          published_at?: string | null
          updated_at?: string
          created_at?: string
          status?: 'draft' | 'published'
          is_published?: boolean
          reading_time?: number
          view_count?: number
          cover_image?: string | null
          og_image?: string | null
          author_id?: string
          meta_title?: string
          meta_description?: string | null
        }
      }
    }
  }
}
