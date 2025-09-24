'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import Dialog, { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { MessageSquare, Trash2, Eye, Calendar, User } from 'lucide-react';
import { getUserPostComments, getCommentStats, deleteComment, deleteAllPostComments, type CommentWithPost, type CommentStats } from '@/features/blog/admin/actions/commentActions';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CommentManager() {
  const [comments, setComments] = useState<CommentWithPost[]>([]);
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingComment, setDeletingComment] = useState<number | null>(null);
  const [deletingPostComments, setDeletingPostComments] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [commentsData, statsData] = await Promise.all([
        getUserPostComments(),
        getCommentStats(),
      ]);
      setComments(commentsData);
      setStats(statsData);
    } catch (error) {
      console.error('コメントデータの取得に失敗:', error);
      toast.error('コメントデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      setDeletingComment(commentId);
      const result = await deleteComment(commentId);
      
      if (result.success) {
        toast.success('コメントを削除しました');
        loadData();
      } else {
        toast.error(result.error || 'コメントの削除に失敗しました');
      }
    } catch (error) {
      console.error('コメント削除エラー:', error);
      toast.error('コメントの削除中にエラーが発生しました');
    } finally {
      setDeletingComment(null);
    }
  };

  const handleDeleteAllPostComments = async (slug: string) => {
    try {
      setDeletingPostComments(slug);
      const result = await deleteAllPostComments(slug);
      
      if (result.success) {
        toast.success(`${result.deletedCount}件のコメントを削除しました`);
        loadData();
      } else {
        toast.error(result.error || 'コメントの一括削除に失敗しました');
      }
    } catch (error) {
      console.error('コメント一括削除エラー:', error);
      toast.error('コメントの一括削除中にエラーが発生しました');
    } finally {
      setDeletingPostComments(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)  }...`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
         {Array.from({ length: 3 }, (_, i) => `loading-comment-${i}`).map((key) => (
           <Card key={key}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats || stats.totalComments === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">コメントがありません</h3>
            <p className="text-muted-foreground">
              記事にコメントが投稿されると、ここに表示されます
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総コメント数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              全記事の合計
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">最近のコメント</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentComments}</div>
            <p className="text-xs text-muted-foreground">
              過去7日間
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">コメント付き記事</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.commentsByPost.filter(post => post.commentCount > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              記事数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 記事別コメント統計 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            記事別コメント統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.commentsByPost
              .filter(post => post.commentCount > 0)
              .map((post) => (
                <div key={post.slug} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{post.title}</h4>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? '公開済み' : '下書き'}
                      </Badge>
                      <Badge variant="outline">{post.commentCount}コメント</Badge>
                    </div>
                    {post.lastCommentAt && (
                      <div className="text-sm text-muted-foreground">
                        最新コメント: {formatDate(post.lastCommentAt)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Eye className="h-4 w-4 mr-1" />
                        表示
                      </Link>
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          一括削除
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>コメントを一括削除</DialogTitle>
                          <DialogDescription>
                            「{post.title}」のすべてのコメント（{post.commentCount}件）を削除します。
                            この操作は取り消せません。
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setDeletingPostComments(null)}
                          >
                            キャンセル
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteAllPostComments(post.slug)}
                            disabled={deletingPostComments === post.slug}
                          >
                            {deletingPostComments === post.slug ? '削除中...' : '削除'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 最近のコメント */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            最近のコメント
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comments.slice(0, 10).map((comment) => (
              <div key={comment.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{comment.author}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {comment.dailyId}
                    </Badge>
                    <Badge variant={comment.postStatus === 'published' ? 'default' : 'secondary'}>
                      {comment.postStatus === 'published' ? '公開済み' : '下書き'}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{truncateText(comment.body)}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>記事: {comment.postTitle}</span>
                    <span>{formatDate(comment.createdAt)}</span>
                    {comment.parentId && (
                      <Badge variant="outline" className="text-xs">返信</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/blog/${comment.slug}`} target="_blank">
                      <Eye className="h-4 w-4 mr-1" />
                      表示
                    </Link>
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        削除
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>コメントを削除</DialogTitle>
                        <DialogDescription>
                          このコメントを削除します。この操作は取り消せません。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="p-3 bg-muted rounded">
                        <p className="text-sm">{comment.body}</p>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeletingComment(null)}
                        >
                          キャンセル
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingComment === comment.id}
                        >
                          {deletingComment === comment.id ? '削除中...' : '削除'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
