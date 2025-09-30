'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { toast } from 'sonner';
import { getPopularTags } from '@/features/blog/admin/actions/searchActions';
import { deleteTag, mergeTags, renameTag } from '@/features/blog/admin/actions/tagActions';

export default function TagManagerModal() {
  const [tags, setTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  const [renameFrom, setRenameFrom] = useState('');
  const [renameTo, setRenameTo] = useState('');

  const [mergeA, setMergeA] = useState('');
  const [mergeB, setMergeB] = useState('');
  const [mergeTo, setMergeTo] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getPopularTags(100);
      setTags(data);
    } catch (e) {
      console.error(e);
      toast.error('タグの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onRename = async () => {
    if (!renameFrom || !renameTo) return;
    const res = await renameTag(renameFrom, renameTo);
    if (res.success) {
      toast.success(`リネームしました（${res.affected}件）`);
      setRenameFrom('');
      setRenameTo('');
      load();
    } else {
      toast.error(res.error);
    }
  };

  const onMerge = async () => {
    if (!mergeA || !mergeB || !mergeTo) return;
    const res = await mergeTags(mergeA, mergeB, mergeTo);
    if (res.success) {
      toast.success(`統合しました（${res.affected}件）`);
      setMergeA('');
      setMergeB('');
      setMergeTo('');
      load();
    } else {
      toast.error(res.error);
    }
  };

  const onDelete = async (t: string) => {
    const res = await deleteTag(t);
    if (res.success) {
      toast.success(`削除しました（${res.affected}件）`);
      load();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-medium">リネーム</div>
          <div className="flex gap-2 items-center">
            <Input placeholder="旧タグ" value={renameFrom} onChange={(e) => setRenameFrom(e.target.value)} />
            <span className="text-muted-foreground">→</span>
            <Input placeholder="新タグ" value={renameTo} onChange={(e) => setRenameTo(e.target.value)} />
            <Button onClick={onRename} disabled={loading}>実行</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="font-medium">統合</div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_1fr_auto] items-center gap-2">
            <Input placeholder="タグA" value={mergeA} onChange={(e) => setMergeA(e.target.value)} />
            <Input placeholder="タグB" value={mergeB} onChange={(e) => setMergeB(e.target.value)} />
            <span className="text-muted-foreground text-center">→</span>
            <Input placeholder="統合先タグ" value={mergeTo} onChange={(e) => setMergeTo(e.target.value)} />
            <Button onClick={onMerge} disabled={loading}>実行</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="font-medium mb-2">タグ一覧</div>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              読み込み中...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t.tag} className="inline-flex items-center gap-2 border rounded-full px-3 py-1 text-sm">
                  <Badge variant="outline">{t.tag}</Badge>
                  <span className="text-muted-foreground text-xs">{t.count}</span>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(t.tag)}>削除</Button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




