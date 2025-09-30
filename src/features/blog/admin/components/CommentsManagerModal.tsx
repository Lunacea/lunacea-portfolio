'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { listCommentsBySlug, deleteComment, setCommentChecked, replyToComment, type AdminComment } from '@/features/blog/admin/actions/commentActions';

export default function CommentsManagerModal() {
  const [slug, setSlug] = useState('');
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [foldByParent, setFoldByParent] = useState<Record<number, boolean>>({});
  const [replyDraftById, setReplyDraftById] = useState<Record<number, string>>({});

  const load = async () => {
    if (!slug.trim()) return;
    try {
      setLoading(true);
      const rows = await listCommentsBySlug(slug.trim());
      setComments(rows);
    } catch (e) {
      console.error(e);
      toast.error('コメントの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<number | 'root', AdminComment[]>();
    for (const c of comments) {
      const key = (c.parentId ?? 'root') as number | 'root';
      const curr = map.get(key) || [];
      curr.push(c);
      map.set(key, curr);
    }
    return map;
  }, [comments]);

  const rootList = grouped.get('root') || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex gap-2 items-center">
          <Input placeholder="slug を入力 (例: welcome-to-my-blog)" value={slug} onChange={(e) => setSlug(e.target.value)} />
          <Button onClick={load} disabled={loading || !slug.trim()}>読み込み</Button>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">読み込み中...</CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {rootList.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">コメントがありません</CardContent>
            </Card>
          ) : (
            rootList.map((root) => {
              const children = (grouped.get(root.id) || []).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
              const folded = !!foldByParent[root.id];
              return (
                <Card key={root.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{root.author}</Badge>
                          <span className="text-xs text-muted-foreground">{root.dailyId}/{root.tripcode}</span>
                          <span className="text-xs text-muted-foreground">{new Date(root.createdAt).toLocaleString('ja-JP')}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{root.body}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => setFoldByParent(prev => ({ ...prev, [root.id]: !folded }))}>
                          {folded ? '展開' : '折りたたみ'} ({children.length})
                        </Button>
                        <Button variant="secondary" size="sm" onClick={async () => {
                          const next = !root.isChecked;
                          const res = await setCommentChecked(root.id, next);
                          if (res.success) { toast.success(next ? '既読にしました' : '未読にしました'); load(); } else { toast.error(res.error || '更新に失敗しました'); }
                        }}>{root.isChecked ? '未読に戻す' : '既読にする'}</Button>
                        <Button aria-label="delete-comment" variant="destructive" size="sm" onClick={async () => {
                          const res = await deleteComment(root.id);
                          if (res.success) { toast.success('削除しました'); load(); } else { toast.error(res.error || '削除に失敗しました'); }
                        }}>削除</Button>
                      </div>
                    </div>
                    {!folded && (
                      <div className="pl-4 border-l space-y-2">
                        <div className="flex items-start gap-2">
                          <textarea className="w-full text-sm border rounded-md p-2"
                            placeholder="返信を書く..."
                            value={replyDraftById[root.id] || ''}
                            onChange={(e) => setReplyDraftById(prev => ({ ...prev, [root.id]: e.target.value }))}
                          />
                          <Button size="sm" onClick={async () => {
                            const text = (replyDraftById[root.id] || '').trim();
                            if (!text) return;
                            const res = await replyToComment(root.id, root.slug, text);
                            if (res.success) { toast.success('返信を投稿しました'); setReplyDraftById(prev => ({ ...prev, [root.id]: '' })); load(); } else { toast.error(res.error || '返信に失敗しました'); }
                          }}>返信</Button>
                        </div>
                        {children.map((c) => (
                          <div key={c.id} className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{c.author}</Badge>
                                <span className="text-xs text-muted-foreground">{c.dailyId}/{c.tripcode}</span>
                                <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString('ja-JP')}</span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap break-words">{c.body}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button variant="secondary" size="sm" onClick={async () => {
                                const next = !c.isChecked;
                                const res = await setCommentChecked(c.id, next);
                                if (res.success) { toast.success(next ? '既読にしました' : '未読にしました'); load(); } else { toast.error(res.error || '更新に失敗しました'); }
                              }}>{c.isChecked ? '未読に戻す' : '既読にする'}</Button>
                              <Button aria-label="delete-comment-reply" variant="destructive" size="sm" onClick={async () => {
                                const res = await deleteComment(c.id);
                                if (res.success) { toast.success('削除しました'); load(); } else { toast.error(res.error || '削除に失敗しました'); }
                              }}>削除</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


