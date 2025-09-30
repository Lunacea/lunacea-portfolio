'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { FaEdit, FaUser, FaCog, FaCheckCircle } from 'react-icons/fa'
import Icon from '@/shared/components/ui/Icon'
import type { AuthUser } from '@/shared/libs/auth-server'

interface DashboardClientProps {
  initialUser: AuthUser
}

export function DashboardClient({ initialUser }: DashboardClientProps) {
  useEffect(() => {
    // URLフラグメント（#以降）をクリーンアップ
    const cleanUrl = () => {
      if (window.location.hash) {
        // アクセストークンやその他のフラグメントを削除
        const cleanUrl = window.location.origin + window.location.pathname + window.location.search
        window.history.replaceState({}, document.title, cleanUrl)
      }
    }

    // ページロード時にURLをクリーンアップ
    cleanUrl()

    // ハッシュ変更を監視（OAuth認証後のリダイレクト用）
    const handleHashChange = () => {
      cleanUrl()
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          ダッシュボード
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          アプリケーションの管理画面です
        </p>
        
        {/* 認証ステータス */}
        <div className="inline-flex items-center gap-3 px-6 py-3 
          bg-gradient-to-r from-green-500/10 to-emerald-500/10 
          backdrop-blur-sm rounded-2xl border border-green-500/20
          shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
        >
          <Icon icon={<FaCheckCircle />} className="text-green-500" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            認証済み: {initialUser.email || initialUser.name || 'ユーザー'}
          </span>
        </div>
      </header>

      {/* 機能カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* ブログ管理カード */}
        <Link href="/dashboard/blog/">
          <article className="group relative overflow-hidden rounded-3xl
            bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
            dark:bg-card dark:from-card dark:to-card
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
            hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
            dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
            dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
            transition-all duration-300 p-8 h-64 flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              dark:from-primary/2 dark:via-transparent dark:to-accent/2 dark:opacity-0 dark:group-hover:opacity-50"
            />
            
            <div className="relative z-1 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Icon icon={<FaEdit />} className="text-primary text-xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  ブログ管理
                </h3>
              </div>
              
              <div className="flex-1 mb-6">
                <p className="text-muted-foreground leading-relaxed">
                  ブログ投稿の作成・編集・管理を行います
                </p>
              </div>
              
              <div className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                ブログエディターへ →
              </div>
            </div>
          </article>
        </Link>

        {/* プロフィールカード */}
        <Link href="/dashboard/user-profile">
          <article className="group relative overflow-hidden rounded-3xl
            bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
            dark:bg-card dark:from-card dark:to-card
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
            hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
            dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
            dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
            transition-all duration-300 p-8 h-64 flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
              opacity-0 group-hover:opacity-100 transition-opacity duration-300
              dark:from-primary/2 dark:via-transparent dark:to-accent/2 dark:opacity-0 dark:group-hover:opacity-50"
            />
            
            <div className="relative z-1 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Icon icon={<FaUser />} className="text-primary text-xl" />
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  プロフィール
                </h3>
              </div>
              
              <div className="flex-1 mb-6">
                <p className="text-muted-foreground leading-relaxed">
                  ユーザー情報の確認・編集を行います
                </p>
              </div>
              
              <div className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                プロフィールへ →
              </div>
            </div>
          </article>
        </Link>

        {/* 設定カード */}
        <article className="group relative overflow-hidden rounded-3xl
          bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
          dark:bg-card dark:from-card dark:to-card
          shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
          dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
          transition-all duration-300 p-8 h-64 flex flex-col opacity-60"
        >
          <div className="relative z-1 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-muted/20 rounded-2xl flex items-center justify-center">
                <Icon icon={<FaCog />} className="text-muted-foreground text-xl" />
              </div>
              <h3 className="text-xl font-bold text-muted-foreground">
                設定
              </h3>
            </div>
            
            <div className="flex-1 mb-6">
              <p className="text-muted-foreground leading-relaxed">
                アプリケーションの設定を行います
              </p>
            </div>
            
            <div className="text-sm text-muted-foreground font-medium">
              準備中...
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
