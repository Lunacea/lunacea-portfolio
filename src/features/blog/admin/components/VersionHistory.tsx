'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Calendar, RotateCcw, Eye } from 'lucide-react';
import { getPostVersions, restorePostToVersion, type BlogPostVersion } from '@/features/blog/admin/actions/versionActions';
import { toast } from 'sonner';

interface VersionHistoryProps {
  postId: number;
  onVersionRestore?: () => void;
}

export default function VersionHistory({ postId, onVersionRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<BlogPostVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);

  const loadVersions = useCallback(async () => {
    try {
      setLoading(true);
      const versionList = await getPostVersions(postId);
      setVersions(versionList);
    } catch (error) {
      console.error('バージョン一覧の取得に失敗:', error);
      toast.error('バージョン一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadVersions();
  }, [postId, loadVersions]);

  const handleRestore = async (version: number) => {
    try {
      setRestoring(version);
      const result = await restorePostToVersion(postId, version);
      
      if (result.success) {
        toast.success(`バージョン ${version} に復元しました`);
        onVersionRestore?.();
      } else {
        toast.error(result.error || 'バージョンの復元に失敗しました');
      }
    } catch (error) {
      console.error('バージョン復元エラー:', error);
      toast.error('バージョンの復元中にエラーが発生しました');
    } finally {
      setRestoring(null);
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

  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return `${content.substring(0, maxLength)  }...`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>バージョン履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground mt-2">読み込み中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>バージョン履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">バージョン履歴がありません</h3>
            <p className="text-muted-foreground">
              記事を編集すると、自動的にバージョンが保存されます
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>バージョン履歴</CardTitle>
        <p className="text-sm text-muted-foreground">
          記事の編集履歴を管理できます
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div key={version.id}>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">v{version.version}</Badge>
                    {index === 0 && (
                      <Badge variant="default">最新</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(version.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {truncateContent(version.content)}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: プレビュー機能を実装
                      toast.info('プレビュー機能は準備中です');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    プレビュー
                  </Button>
                  {index > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version.version)}
                      disabled={restoring === version.version}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      {restoring === version.version ? '復元中...' : '復元'}
                    </Button>
                  )}
                </div>
              </div>
              {index < versions.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
