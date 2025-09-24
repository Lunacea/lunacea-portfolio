import { auth } from '@/shared/libs/auth-server';
import { redirect } from 'next/navigation';
import { db } from '@/shared/libs/blog-db';
import { blogPosts } from '@/shared/models/Schema';
import { eq, and, desc } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, Edit, Eye, Clock } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '下書き一覧 - ブログエディター',
  description: '下書き状態の記事を管理します',
};

export default async function DraftsPage() {
  // 認証チェック
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  // 下書き記事の取得
      const drafts = await db.select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.authorId, userId),
        eq(blogPosts.status, 'draft')
      )
    )
    .orderBy(desc(blogPosts.updatedAt));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">下書き一覧</h1>
        <p className="text-muted-foreground mt-2">
          下書き状態の記事を管理します
        </p>
      </div>

      {drafts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">下書きがありません</h3>
              <p className="text-muted-foreground mb-4">
                新しい記事を作成して下書きとして保存できます
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
          {drafts.map((draft: { id: number; title: string; description?: string | null; tags?: string[] | null; updatedAt: Date; createdAt: Date; slug: string }) => (
            <Card key={draft.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{draft.title}</CardTitle>
                    {draft.description && (
                      <p className="text-muted-foreground mb-3">{draft.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          作成: {draft.createdAt.toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          更新: {draft.updatedAt.toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">下書き</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {draft.tags && draft.tags.length > 0 && (
                      <div className="flex gap-1">
                        {draft.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {draft.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{draft.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/blog/preview/${draft.slug}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        プレビュー
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/blog/edit/${draft.slug}`}>
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
