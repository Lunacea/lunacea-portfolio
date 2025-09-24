import { auth } from '@/shared/libs/auth-server';
import { redirect } from 'next/navigation';
import { db } from '@/shared/libs/blog-db';
import { blogPosts } from '@/shared/models/Schema';
import { eq, and, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, Edit, Eye, ExternalLink, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '公開済み記事 - ブログエディター',
  description: '公開済みの記事を管理します',
};

export default async function PublishedPage() {
  // 認証チェック
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 公開済み記事の取得
      const publishedPosts = await db.select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.authorId, userId),
        eq(blogPosts.status, 'published')
      )
    )
    .orderBy(desc(blogPosts.publishedAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">公開済み記事</h1>
        <p className="text-muted-foreground mt-2">
          公開済みの記事を管理します
        </p>
      </div>

      {publishedPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">公開済み記事がありません</h3>
              <p className="text-muted-foreground mb-4">
                記事を公開すると、ここに表示されます
              </p>
              <Button asChild>
                <Link href="/dashboard/blog/create">
                  新しい記事を作成
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {publishedPosts.map((post: { id: number; title: string; description?: string | null; tags?: string[] | null; publishedAt: Date | null; viewCount?: number | null; readingTime?: number | null; slug: string }) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    {post.description && (
                      <p className="text-muted-foreground mb-3">{post.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          公開: {post.publishedAt?.toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>
                          閲覧数: {post.viewCount || 0}
                        </span>
                      </div>
                      {post.readingTime && (
                        <div className="flex items-center gap-1">
                          <span>読了時間: {post.readingTime}分</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="default">公開済み</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        表示
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/blog/preview/${post.slug}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        プレビュー
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/blog/edit/${post.slug}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        編集
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
