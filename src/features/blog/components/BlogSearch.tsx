'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { BlogPostMeta } from '@/shared/libs/blog.impl';

type BlogSearchProps = {
  posts: BlogPostMeta[];
  onSearchResults: (filteredPosts: BlogPostMeta[]) => void;
};

export default function BlogSearch({ posts, onSearchResults }: BlogSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return posts;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return posts.filter(post => {
      // タイトルで検索
      if (post.title.toLowerCase().includes(query)) {
        return true;
      }
      
      // 説明で検索
      if (post.description?.toLowerCase().includes(query)) {
        return true;
      }
      
      // タグで検索
      if (post.tags.some(tag => tag.toLowerCase().includes(query))) {
        return true;
      }
      
      // 抜粋で検索（本文の一部）
      if (post.excerpt?.toLowerCase().includes(query)) {
        return true;
      }
      
      return false;
    });
  }, [posts, searchQuery]);

  // 検索結果を親コンポーネントに通知
  useEffect(() => {
    onSearchResults(filteredPosts);
  }, [filteredPosts, onSearchResults]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="記事を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="検索をクリア"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* 検索結果の表示 */}
      {searchQuery && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {filteredPosts.length > 0 ? (
            <span>{filteredPosts.length}件の記事が見つかりました</span>
          ) : (
            <div className="space-y-2">
              <p>「{searchQuery}」に一致する記事が見つかりませんでした</p>
              <div className="text-sm">
                <p>関連するタグで試してみてください：</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {(() => {
                    // 検索クエリに関連するタグを提案
                    const query = searchQuery.toLowerCase().trim();
                    const relatedTags = posts
                      .flatMap(post => post.tags)
                      .filter(tag => tag.toLowerCase().includes(query))
                      .filter((tag, index, array) => array.indexOf(tag) === index) // 重複削除
                      .slice(0, 5);
                    
                    return relatedTags.length > 0 ? (
                      relatedTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-4 py-2 bg-muted hover:bg-muted/80 active:bg-muted/90 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center"
                        >
                          #{tag}
                        </button>
                      ))
                    ) : (
                      // 関連タグがない場合は人気タグを表示
                      (() => {
                        const tagCounts = posts
                          .flatMap(post => post.tags)
                          .reduce((acc, tag) => {
                            acc[tag] = (acc[tag] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                        
                        return Object.entries(tagCounts)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([tag]) => (
                            <button
                              key={tag}
                              onClick={() => setSearchQuery(tag)}
                              className="px-4 py-2 bg-muted hover:bg-muted/80 active:bg-muted/90 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center"
                            >
                              #{tag}
                            </button>
                          ));
                      })()
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
