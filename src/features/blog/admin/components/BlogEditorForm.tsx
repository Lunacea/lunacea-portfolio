'use client';

import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import TagInput from './TagInput';
import { createBlogPost, updateBlogPost } from '@/features/blog/admin/actions/blogActions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import BlogPreview from './BlogPreview';
import MarkdownToolbar from './MarkdownToolbar';
import dynamic from 'next/dynamic';
import { extractTableOfContentsFromMarkdown } from '@/shared/libs/mdx-client';
import { useTranslations } from 'next-intl';

const TableOfContents = dynamic(() => import('@/features/blog/shared/components/TableOfContents'), { ssr: false, loading: () => null }) as React.ComponentType<{ items: { id: string; title: string; level: number }[]; className?: string }>;

// フォームのバリデーションスキーマ
const blogPostSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(255, 'タイトルは255文字以内で入力してください'),
  slug: z.string().min(1, 'slugは必須です').max(255, 'slugは255文字以内で入力してください'),
  description: z.string().max(500, '説明は500文字以内で入力してください').optional(),
  content: z.string().min(1, 'コンテンツは必須です'),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

interface BlogEditorFormProps {
  initialData?: {
    id: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    tags: string;
    status: 'draft' | 'published';
  };
}

export default function BlogEditorForm({ initialData }: BlogEditorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode] = useState(false);
  const router = useRouter();
  const t = useTranslations('BlogEditor');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      content: initialData?.content || '',
      tags: initialData?.tags || '',
      status: initialData?.status || 'draft',
    },
  });

  const watchedContent = watch('content');
  const watchedTitle = watch('title');
  const watchedTags = watch('tags');
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [layoutMode, setLayoutMode] = useState<'split' | 'editor' | 'preview'>('split');

  // タグの処理

  const setTagsArray = (tags: string[]) => {
    setValue('tags', tags.join(', '), { shouldDirty: true });
  };

  const parseTags = (tagsString: string): string[] => {
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  // メタデータの簡易生成
  const generateMetaTitle = (title: string) => (title ? `${title} | Blog` : 'タイトル未設定 | Blog');
  const generateMetaDescription = (description: string, content: string) => {
    if (description && description.trim().length > 0) return description.trim();
    const plain = content.replace(/```[\s\S]*?```/g, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
      .replace(/\[[^\]]*\]\([^)]*\)/g, '$1')  // links
      .replace(/[-#*_`~>]+/g, ' ')              // md tokens
      .replace(/\s+/g, ' ')
      .trim();
    return plain.substring(0, 160);
  };
  const metaTitle = generateMetaTitle(watchedTitle || '');
  const metaDescription = generateMetaDescription(getValues('description') || '', watchedContent || '');
  const metaKeywords = parseTags(getValues('tags') || '').join(', ');

  // RHF register を保持して textarea の ref と合成
  const contentRegister = register('content');

  const tocItems = useMemo(() => {
    try {
      return extractTableOfContentsFromMarkdown(watchedContent || '');
    } catch {
      return [] as Array<{ id: string; title: string; level: number }>;
    }
  }, [watchedContent]);

  const onSubmit = async (data: BlogPostFormData) => {
    setIsSubmitting(true);

    try {
      const tags = parseTags(data.tags || '');

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('slug', data.slug);
      formData.append('description', data.description || '');
      formData.append('content', data.content);
      formData.append('tags', JSON.stringify(tags));
      formData.append('status', data.status);

      const result = initialData
        ? await updateBlogPost(initialData.id, formData)
        : await createBlogPost(formData);

      if (result.success) {
        toast.success(initialData ? '記事が正常に更新されました' : '記事が正常に保存されました');
        router.push('/dashboard/blog');
      } else {
        toast.error(result.error || '記事の保存に失敗しました');
      }
    } catch (error) {
      console.error('記事保存エラー:', error);
      toast.error('記事の保存中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 上部: タグ → タイトル → slug → 説明 → 自動メタ */}
      <div className="space-y-6 max-w-4xl">
        {/* タグ */}
        <Card className="shadow-none border-0 bg-transparent">
          <CardHeader className="pt-0 pb-2 px-0">
            <CardTitle className="text-base font-medium tracking-normal">Tags</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TagInput
              value={parseTags(watchedTags || '')}
              onChangeAction={setTagsArray}
              placeholder={t('tags_placeholder')}
            />
          </CardContent>
        </Card>

        {/* タイトル */}
        <Card className="shadow-none border-0 bg-transparent">
          <CardHeader className="pt-0 pb-2 px-0">
            <CardTitle className="text-base font-medium tracking-normal">Title</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Input
              {...register('title')}
              placeholder={t('title_placeholder')}
              className="text-base border-0 border-b focus-visible:ring-0 rounded-none p-4"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </CardContent>
        </Card>

        {/* slug */}
        <Card className="shadow-none border-0 bg-transparent">
          <CardHeader className="pt-0 pb-2 px-0">
            <CardTitle className="text-base font-medium tracking-normal">Slug</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Input
              {...register('slug')}
              placeholder={t('slug_placeholder')}
              className="text-base border-0 border-b focus-visible:ring-0 rounded-none p-4"
            />
          </CardContent>
          {errors.slug && (
            <p className="text-sm text-destructive mt-1">{errors.slug.message}</p>
          )}
        </Card>

        {/* 説明 */}
        <Card className="shadow-none border-0 bg-transparent">
          <CardHeader className="pt-0 pb-2 px-0">
            <CardTitle className="text-base font-medium tracking-normal">Description</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              {...register('description')}
              placeholder={t('description_placeholder')}
              rows={3}
              className="border-0 border-b focus-visible:ring-0 rounded-none p-4"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </CardContent>
        </Card>

        {/* ツールバー（常時表示） */}
        <div className="max-w-7xl mx-auto">
          <MarkdownToolbar
            textareaRef={contentRef}
            onChangeContentAction={(next) => setValue('content', next, { shouldDirty: true })}
            onSaveDraftAction={handleSaveDraft}
            onPublishAction={handlePublish}
            onChangeLayoutModeAction={(mode) => setLayoutMode(mode)}
            disabled={isSubmitting}
            currentLayoutMode={layoutMode}
            className="mb-2"
          />
        </div>

        {/* 本文レイアウト切替: split / editor / preview */}
        {layoutMode === 'split' && (
          <div className="grid gap-6 lg:grid-cols-2 max-w-7xl mx-auto">
            {/* エディタ */}
            <Card className="shadow-none border-0 bg-transparent">
              <CardHeader className="px-0 hidden" />
              <CardContent className={`${isPreviewMode ? 'hidden lg:block ' : ''}p-0`}>
                <Textarea
                  {...contentRegister}
                  ref={(el) => {
                    contentRegister.ref(el);
                    contentRef.current = el;
                  }}
                  placeholder={t('content_placeholder')}
                  rows={20}
                  className="font-mono text-sm border-0 focus-visible:ring-0 p-4"
                />
                {errors.content && (<p className="text-sm text-destructive mt-1">{errors.content.message}</p>)}
              </CardContent>
            </Card>
            {/* プレビュー */}
            <Card className="shadow-none border-0 bg-transparent lg:border-l lg:border-border lg:pl-6">
              <CardHeader className="hidden" />
              <CardContent className={`${!isPreviewMode ? 'hidden lg:block ' : ''}p-0`}>
                <BlogPreview
                  title={watchedTitle}
                  content={watchedContent}
                  description={getValues('description')}
                  tags={parseTags(getValues('tags') || '')}
                />
                <div className="mt-6 lg:hidden">
                  <TableOfContents items={tocItems} className="sticky top-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {layoutMode === 'editor' && (
          <div className="max-w-7xl mx-auto">
            <Card className="shadow-none border-0 bg-transparent">
              <CardContent className="p-0">
                <Textarea
                  {...contentRegister}
                  ref={(el) => {
                    contentRegister.ref(el);
                    contentRef.current = el;
                  }}
                  placeholder={t('content_placeholder')}
                  rows={24}
                  className="font-mono text-sm border-0 focus-visible:ring-0 p-4"
                />
                {errors.content && (<p className="text-sm text-destructive mt-1">{errors.content.message}</p>)}
              </CardContent>
            </Card>
          </div>
        )}

        {layoutMode === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-6 max-w-7xl mx-auto">
            <Card className="shadow-none border-0 bg-transparent">
              <CardContent className="p-0">
                <BlogPreview
                  title={watchedTitle}
                  content={watchedContent}
                  description={getValues('description')}
                  tags={parseTags(getValues('tags') || '')}
                />
                <div className="mt-6 lg:hidden">
                  <TableOfContents items={tocItems} className="sticky top-20" />
                </div>
              </CardContent>
            </Card>
            <aside className="hidden lg:block">
              <div className="sticky top-[6.5rem]">
                <TableOfContents items={tocItems} />
              </div>
            </aside>
          </div>
        )}

        {/* セパレータ */}
        <div className="h-px border-b border-border" />

        {/* 公開設定 + 記事情報 */}
        {/* メタデータのプレビュー */}
        <Card className="shadow-none border-0 bg-transparent">
          <CardHeader className="py-2 px-0">
            <CardTitle className="text-base font-medium tracking-normal">メタデータ</CardTitle>
          </CardHeader>
          {/* TODO: テーブル調にレイアウトを変更 */}
          <CardContent className="p-0">
            <div className="space-y-3 text-sm">
              <div className="flex gap-4">
                <div className="w-24 text-muted-foreground font-medium">title</div>
                <div className="flex-1 break-all text-foreground">{metaTitle}</div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 text-muted-foreground font-medium">URL</div>
                <div className="flex-1 break-all text-foreground">{getValues('slug') || '—'}</div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 text-muted-foreground font-medium">description</div>
                <div className="flex-1 break-all text-foreground">{metaDescription || '—'}</div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 text-muted-foreground font-medium">keywords</div>
                <div className="flex-1 break-all text-foreground">{metaKeywords || '—'}</div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 text-muted-foreground font-medium">文字数</div>
                <div className="flex-1 text-foreground">{watchedContent?.length || 0}</div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 text-muted-foreground font-medium">タグ数</div>
                <div className="flex-1 text-foreground">{parseTags(getValues('tags') || '').length}</div>
              </div>
              <div className="flex gap-4">
                <div className="w-24 text-muted-foreground font-medium">作成日</div>
                <div className="flex-1 text-foreground">{new Date().toLocaleDateString('ja-JP')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
