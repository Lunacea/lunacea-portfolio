import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import Link from 'next/link';
import { Calendar, Eye, PenSquare, EyeOff, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { type SearchResult } from '@/features/blog/admin/actions/searchActions';
import { updatePostStatus } from '@/features/blog/admin/actions/blogActions';
// いいね数は親から受け取る

export default function ArticleList({ 
  articles, 
  load, 
  loading,
  likeCounts = {}
}: { 
  articles: SearchResult[], 
  load: () => Promise<void>, 
  loading: boolean,
  likeCounts?: Record<number, number>
}) {

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {articles[0]?.status === 'published' ? '公開済み記事はありません' : '下書きはありません'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((d) => (
        <Card key={d.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{d.title}</h4>
                  <Badge variant={d.status === 'published' ? 'default' : 'secondary'}>{d.status === 'published' ? '公開済み' : '下書き'}</Badge>
                </div>
                {(d.description || d.excerpt) && (
                  <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                    {d.description || d.excerpt}
                  </p>
                )}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(d.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{d.viewCount} 回閲覧</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{likeCounts[d.id] || 0} いいね</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/dashboard/blog/edit/${d.slug}`}><PenSquare className="h-4 w-4" /></Link>
                  </Button>
                  {d.status === 'published' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        await updatePostStatus(d.id, 'draft');
                        await load();
                        toast.success('下書きに戻しました');
                      }}
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  )}
                  {d.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        try {
                          await updatePostStatus(d.id, 'published');
                          await load();
                          toast.success('公開しました');
                        } catch {
                          toast.error('公開に失敗しました');
                        } finally {
                        }
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
