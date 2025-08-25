'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { FaComment } from 'react-icons/fa';
import { useComments } from '../hooks/useComments';
import { CommentForm } from './CommentForm';

type Comment = {
  id: number;
  slug: string;
  author: string;
  body: string;
  createdAt: string;
  dailyId: string;
  tripcode: string;
  parentId: number | null;
};

type CommentsSectionProps = {
  slug: string;
};

export default function CommentsSection({ slug }: CommentsSectionProps) {
  const t = useTranslations('Comments');
  const { comments, isLoading, error, fetchComments, createComment } = useComments(slug);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [slug, fetchComments]);

  const handleSubmit = async (data: { author?: string; body: string; parentId?: number }) => {
    const result = await createComment({
      ...data,
      parentId: replyTo ?? undefined,
    });

    if (result.success) {
      setReplyTo(null);
    }
    return result;
  };

  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();

    // 負の値（未来の時間）の場合は「今」と表示
    if (diffInMs < 0) {
      return '今';
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return '今';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else if (diffInHours < 24) {
      return `${diffInHours}時間前`;
    } else {
      return `${diffInDays}日前`;
    }
  };

  return (
    <section aria-labelledby="comments-title" className="mt-12">
      <h2 id="comments-title" className="text-xl font-semibold mb-4">
        {t('title')}
      </h2>

      {replyTo === null && (
        <div className="mb-6">
          <CommentForm
            onSubmit={handleSubmit}
            submitLabel={t('post')}
          />
        </div>
      )}

      {isLoading
        ? (
            <p className="text-muted-foreground">{t('loading')}</p>
          )
        : error
          ? (
              <p className="text-sm text-destructive">{t('failed')}</p>
            )
          : (comments?.length ?? 0) === 0
              ? (
                  <p className="text-muted-foreground">{t('empty')}</p>
                )
              : (
                  <ThreadedList
                    comments={comments ?? []}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    onSubmit={handleSubmit}
                    t={t}
                    getRelativeTime={getRelativeTime}
                  />
                )}
    </section>
  );
}

type ThreadedListProps = {
  comments: Comment[];
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  onSubmit: (data: { author?: string; body: string; parentId?: number }) => Promise<{ success: boolean; error?: string }>;
  t: (key: string) => string;
  getRelativeTime: (dateString: string) => string;
};

function ThreadedList(props: ThreadedListProps) {
  const { comments, replyTo, setReplyTo, onSubmit, t, getRelativeTime } = props;
  const byParent = new Map<number | null, Comment[]>();
  for (const c of comments) {
    const key = c.parentId ?? null;
    const arr = byParent.get(key) ?? [];
    arr.push(c);
    byParent.set(key, arr);
  }

  const renderBranch = (parentId: number | null, depth: number) => {
    const nodes = byParent.get(parentId) ?? [];
    return (
      <ul className={depth === 0 ? 'space-y-4' : 'mt-3 space-y-3 pl-4 border-l border-border/50'}>
        {nodes.map(node => (
          <li key={node.id} className="border-t border-b border-border p-2">
            <div className="mb-3">
              <div className="text-base font-medium mb-1 flex items-baseline gap-2">
                <span>{node.author || 'anonymous'}</span>
                <span className="text-sm text-muted-foreground">
                  {getRelativeTime(node.createdAt)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground space-x-3">
                <span>
                  ID:
                  {(node.dailyId ?? '').slice(0, 8)}
                </span>
                <span>
                  ◆
                  {(node.tripcode ?? '').slice(0, 6)}
                </span>
              </div>
            </div>

            <p className="whitespace-pre-wrap leading-relaxed my-2">{node.body}</p>

            <div className="flex justify-between items-center py-2">
              <button
                type="button"
                className="text-sm text-primary hover:underline hover:text-primary/80 transition-colors flex items-center gap-1"
                onClick={() => setReplyTo(node.id)}
              >
                <FaComment className="text-xs" />
                {t('reply')}
              </button>
            </div>

            {replyTo === node.id && (
              <div className="my-4">
                <CommentForm
                  onSubmit={onSubmit}
                  onCancel={() => setReplyTo(null)}
                  submitLabel={t('post')}
                  cancelLabel="Cancel"
                />
              </div>
            )}

            {renderBranch(node.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return renderBranch(null, 0);
}
