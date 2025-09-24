'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import Dialog, { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Tag, Edit, Trash2, Calendar } from 'lucide-react';
import { getAllCategoryStats, renameCategory, deleteCategory, type CategoryStats } from '@/features/blog/admin/actions/categoryActions';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CategoryManager() {
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoryStats = await getAllCategoryStats();
      setCategories(categoryStats);
    } catch (error) {
      console.error('カテゴリ一覧の取得に失敗:', error);
      toast.error('カテゴリ一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (oldTag: string, newTag: string) => {
    if (!newTag.trim() || newTag.trim() === oldTag) {
      return;
    }

    try {
      const result = await renameCategory(oldTag, newTag.trim());
      
       if (result.success) {
         toast.success(`カテゴリ「${oldTag}」を「${newTag}」に変更しました`);
         setNewCategoryName('');
         loadCategories();
       } else {
        toast.error(result.error || 'カテゴリ名の変更に失敗しました');
      }
    } catch (error) {
      console.error('カテゴリ名変更エラー:', error);
      toast.error('カテゴリ名の変更中にエラーが発生しました');
    }
  };

  const handleDelete = async (tag: string) => {
    try {
      const result = await deleteCategory(tag);
      
       if (result.success) {
         toast.success(`カテゴリ「${tag}」を削除しました`);
         loadCategories();
       } else {
        toast.error(result.error || 'カテゴリの削除に失敗しました');
      }
    } catch (error) {
      console.error('カテゴリ削除エラー:', error);
      toast.error('カテゴリの削除中にエラーが発生しました');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="space-y-4">
         {Array.from({ length: 3 }, (_, i) => `loading-category-${i}`).map((key) => (
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

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">カテゴリがありません</h3>
            <p className="text-muted-foreground">
              記事にタグを追加すると、ここにカテゴリとして表示されます
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <Card key={category.tag}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                <CardTitle className="text-lg">{category.tag}</CardTitle>
                <Badge variant="outline">{category.count}記事</Badge>
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      名前変更
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>カテゴリ名を変更</DialogTitle>
                      <DialogDescription>
                        「{category.tag}」の名前を変更します。すべての記事のタグが更新されます。
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newCategoryName">新しいカテゴリ名</Label>
                        <Input
                          id="newCategoryName"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="新しいカテゴリ名を入力"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setNewCategoryName('');
                        }}
                      >
                        キャンセル
                      </Button>
                      <Button
                        onClick={() => handleRename(category.tag, newCategoryName)}
                        disabled={!newCategoryName.trim() || newCategoryName.trim() === category.tag}
                      >
                        変更
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      削除
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>カテゴリを削除</DialogTitle>
                      <DialogDescription>
                        「{category.tag}」を削除します。すべての記事からこのタグが削除されます。
                        この操作は取り消せません。
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                         <Button
                           variant="outline"
                         >
                           キャンセル
                         </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(category.tag)}
                      >
                        削除
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{category.count}</div>
                <div className="text-sm text-muted-foreground">総記事数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{category.publishedCount}</div>
                <div className="text-sm text-muted-foreground">公開済み</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{category.draftCount}</div>
                <div className="text-sm text-muted-foreground">下書き</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{category.totalViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">総閲覧数</div>
              </div>
            </div>

            {category.recentPosts.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  最近の記事
                </h4>
                <div className="space-y-2">
                  {category.recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{post.title}</span>
                          <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status === 'published' ? '公開済み' : '下書き'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(post.updatedAt)}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/blog/edit/${post.slug}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          編集
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
