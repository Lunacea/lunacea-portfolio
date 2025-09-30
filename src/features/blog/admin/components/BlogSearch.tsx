'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Search, Filter, Calendar, Eye, Clock } from 'lucide-react';
import { searchBlogPosts, getSearchSuggestions, getPopularTags, type SearchResult, type SearchOptions } from '@/features/blog/admin/actions/searchActions';
import { updatePostStatus } from '@/features/blog/admin/actions/blogActions';
import { toast } from 'sonner';
import Link from 'next/link';
import { useDebounce } from '@/shared/hooks/useDebounce';

type AdminBlogSearchProps = {
  initialQuery?: string;
  initialStatus?: 'all' | 'draft' | 'published';
};

export default function AdminBlogSearch({ initialQuery = '', initialStatus = 'all' }: AdminBlogSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<'all' | 'draft' | 'published'>(initialStatus);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // 人気タグの読み込み
  useEffect(() => {
    loadPopularTags();
  }, []);

  const loadPopularTags = async () => {
    try {
      const tags = await getPopularTags();
      setPopularTags(tags);
    } catch (error) {
      console.error('人気タグの取得に失敗:', error);
    }
  };

  const performSearch = useCallback(async () => {
    try {
      setLoading(true);
      const searchOptions: SearchOptions = {
        query: debouncedQuery.trim() || undefined,
        status: status === 'all' ? undefined : status,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        limit: 50,
      };

      const searchResult = await searchBlogPosts(searchOptions);
      setResults(searchResult.results);
      setTotal(searchResult.total);
    } catch (error) {
      console.error('検索に失敗:', error);
      toast.error('検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, status, selectedTags]);

  // 検索の実行
  useEffect(() => {
    if (debouncedQuery.trim() || status !== 'all' || selectedTags.length > 0) {
      performSearch();
    } else {
      setResults([]);
      setTotal(0);
    }
  }, [debouncedQuery, status, selectedTags, performSearch]);

  const handleQueryChange = async (value: string) => {
    setQuery(value);
    
    if (value.trim()) {
      try {
        const newSuggestions = await getSearchSuggestions(value);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('検索候補の取得に失敗:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setStatus('all');
    setSelectedTags([]);
    setShowSuggestions(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* 検索フォーム */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            記事を検索
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 検索クエリ */}
          <div className="relative">
            <Input
              placeholder="タイトル、説明、内容で検索..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1">
                 {suggestions.map((suggestion) => (
                   <button
                     key={suggestion}
                     className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                     onClick={() => handleSuggestionClick(suggestion)}
                   >
                     {suggestion}
                   </button>
                 ))}
              </div>
            )}
          </div>

          {/* フィルター */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={status} onValueChange={(value: 'all' | 'draft' | 'published') => setStatus(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="published">公開済み</SelectItem>
                  <SelectItem value="draft">下書き</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm" onClick={clearFilters}>
              フィルターをクリア
            </Button>
          </div>

          {/* 人気タグ */}
          {popularTags.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">人気のタグ</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map((tagData) => (
                  <Badge
                    key={tagData.tag}
                    variant={selectedTags.includes(tagData.tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tagData.tag)}
                  >
                    {tagData.tag} ({tagData.count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 検索結果 */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-2">検索中...</span>
          </CardContent>
        </Card>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              検索結果 ({total}件)
            </h3>
          </div>
          
          <div className="space-y-3">
            {results.map((result) => (
              <Card key={result.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{result.title}</h4>
                        <Badge variant={result.status === 'published' ? 'default' : 'secondary'}>
                          {result.status === 'published' ? '公開済み' : '下書き'}
                        </Badge>
                      </div>
                      
                      {(result.description || result.excerpt) && (
                        <p className="text-muted-foreground text-sm mb-2">
                          {result.description || result.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(result.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{result.viewCount} 回閲覧</span>
                        </div>
                        {result.readingTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{result.readingTime}分</span>
                          </div>
                        )}
                      </div>

                      {result.tags && result.tags.length > 0 && (
                        <div className="flex gap-1">
                           {result.tags.slice(0, 3).map((tag) => (
                             <Badge key={tag} variant="outline" className="text-xs">
                               {tag}
                             </Badge>
                           ))}
                          {result.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{result.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/blog/edit/${result.slug}`}>
                      編集
                    </Link>
                  </Button>
                  {result.status === 'draft' ? (
                    <Button variant="default" size="sm" onClick={async () => {
                      try {
                        setLoading(true);
                        await updatePostStatus(result.id, 'published');
                        await performSearch();
                        toast.success('公開しました');
                      } catch {
                        toast.error('公開に失敗しました');
                      } finally {
                        setLoading(false);
                      }
                    }}>公開</Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={async () => {
                      try {
                        setLoading(true);
                        await updatePostStatus(result.id, 'draft');
                        await performSearch();
                        toast.success('下書きに戻しました');
                      } catch {
                        toast.error('更新に失敗しました');
                      } finally {
                        setLoading(false);
                      }
                    }}>下書き</Button>
                  )}
                </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (query.trim() || status !== 'all' || selectedTags.length > 0) ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">検索結果がありません</h3>
              <p className="text-muted-foreground">
                検索条件を変更して再度お試しください
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
