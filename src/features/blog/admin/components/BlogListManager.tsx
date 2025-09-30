'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { searchBlogPosts, type SearchResult } from '@/features/blog/admin/actions/searchActions';
import ArticleList from '@/features/blog/admin/components/ArticleList';
import Icon from '@/shared/components/ui/Icon';
import { FaCheckCircle, FaPen, FaSpinner } from 'react-icons/fa';
import { cn } from '@/shared/libs/utils';

export default function BlogListManager({ initialDrafts, initialPublished, initialLikeCounts }: { initialDrafts?: SearchResult[]; initialPublished?: SearchResult[]; initialLikeCounts?: Record<number, number> }) {
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<SearchResult[]>(initialDrafts ?? []);
  const [published, setPublished] = useState<SearchResult[]>(initialPublished ?? []);
  const [likeCounts] = useState<Record<number, number>>(initialLikeCounts ?? {});
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');

  const handleTabChange = (tab: 'drafts' | 'published') => {
    setActiveTab(tab);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [d, p] = await Promise.all([
        searchBlogPosts({ status: 'draft', limit: 100 }),
        searchBlogPosts({ status: 'published', limit: 100 }),
      ]);
      setDrafts(d.results);
      setPublished(p.results);
    } catch (e) {
      console.error(e);
      toast.error('記事リストの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialDrafts || !initialPublished) {
      load();
    }
  }, [load, initialDrafts, initialPublished]);

  return (
    <div className="space-y-6">
      {/* ヘッダー操作列 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="flex items-center gap-2 bg-accent hover:bg-accent/80 hover:text-accent-foreground active:bg-accent/60">
            <Link href="/dashboard/blog/create"><Icon icon={<FaPen />} className="text-primary" />記事を書く</Link>
          </Button>
        </div>
        <div className="text-xs text-muted-foreground px-2">
          {loading ? <Icon icon={<FaSpinner />} className="text-primary animate-spin" /> : <Icon icon={<FaCheckCircle />} className="text-primary" />}
        </div>
      </div>

      {/* タブ */}
      <div className="flex items-center gap-2 border-b">
        <div className={cn("flex flex-1 justify-center items-center gap-2", activeTab === 'drafts' ? 'border-b-2 border-primary' : '')}>
        <Button variant="ghost" size="sm" onClick={() => handleTabChange('drafts')}>下書き</Button>
        </div>
        <div className={cn("flex flex-1 justify-center items-center gap-2", activeTab === 'published' ? 'border-b-2 border-primary' : '')}>
        <Button variant="ghost" size="sm" onClick={() => handleTabChange('published')}>公開済み</Button>
        </div>
      </div>
      {/* 下書き */}
      {activeTab === 'drafts' && (
      <section aria-labelledby="drafts">
        {drafts.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">下書きはありません</CardContent></Card>
        ) : (
          <div className="space-y-3">
            <ArticleList articles={drafts} load={load} loading={loading} likeCounts={likeCounts} />
          </div>
        )}
      </section>
      )}

      {/* 公開済み */}
      {activeTab === 'published' && (
      <section aria-labelledby="published">
        {published.length === 0 ? (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">公開済み記事はありません</CardContent></Card>
        ) : (
          <div className="space-y-3">
            <ArticleList articles={published} load={load} loading={loading} likeCounts={likeCounts} />
          </div>
          )}
        </section>
      )}
    </div>
  );
}




