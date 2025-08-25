'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

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
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/v1/comments?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('failed');
        }
        const json = await res.json();
        if (mounted) {
          setComments(json.data ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('failed');
          setComments([]);
        }
      })
      .finally(() => {
        // no-op
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, author, body, parentId: replyTo ?? undefined }),
      });
      if (!res.ok) {
        throw new Error('failed');
      }
      const json = await res.json();
      // 返信含めてリスト再取得して整合性を保つ
      const refreshed = await fetch(`/api/v1/comments?slug=${encodeURIComponent(slug)}`).then(r => r.json()).catch(() => null);
      if (refreshed?.data) {
        setComments(refreshed.data);
      } else {
        setComments(prev => [json.data, ...((prev ?? []) as Comment[])]);
      }
      setBody('');
      setReplyTo(null);
    } catch {
      setError('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="comments-title" className="mt-12">
      <h2 id="comments-title" className="text-xl font-semibold mb-4">{t('title')}</h2>
      {replyTo === null && (
        <form onSubmit={onSubmit} className="mb-6 space-y-3">
          <div>
            <label htmlFor="comment-author" className="block text-sm mb-1">{t('name_label')}</label>
            <input
              id="comment-author"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              maxLength={80}
              placeholder={t('name_placeholder')}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="comment-body" className="block text-sm mb-1">{t('comment_label')}</label>
            <textarea
              id="comment-body"
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              maxLength={4000}
              rows={4}
              placeholder={t('comment_placeholder')}
              className="w-full rounded-md border border-border bg-background px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
            >
              {isSubmitting ? t('posting') : t('post')}
            </button>
            {error && <p className="text-sm text-destructive">{t('failed')}</p>}
          </div>
        </form>
      )}

      {comments === null
        ? (
            <p className="text-muted-foreground">{t('loading')}</p>
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
                  author={author}
                  setAuthor={setAuthor}
                  body={body}
                  setBody={setBody}
                  isSubmitting={isSubmitting}
                  onSubmit={onSubmit}
                  t={t}
                />
              )}
    </section>
  );
}

type ThreadedListProps = {
  comments: Comment[];
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  author: string;
  setAuthor: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  t: (key: string) => string;
};

function ThreadedList(props: ThreadedListProps) {
  const { comments, replyTo, setReplyTo, author, setAuthor, body, setBody, isSubmitting, onSubmit, t } = props;
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
          <li key={node.id} className="rounded-lg border border-border p-4">
            <div className="mb-2 text-xs text-muted-foreground">
              <span className="font-medium">{node.author || 'anonymous'}</span>
              <span className="mx-2">
                ID:
                {(node.dailyId ?? '').slice(0, 8)}
              </span>
              <span className="mx-2">
                ◆
                {(node.tripcode ?? '').slice(0, 6)}
              </span>
              <span className="mx-2">{new Date(node.createdAt).toLocaleString()}</span>
              <button
                type="button"
                className="ml-2 text-primary hover:underline"
                onClick={() => setReplyTo(node.id)}
              >
                Reply
              </button>
            </div>

            {replyTo === node.id && (
              <form onSubmit={onSubmit} className="mb-4 space-y-2">
                <div>
                  <label htmlFor={`reply-author-${node.id}`} className="sr-only">{t('name_label')}</label>
                  <input
                    id={`reply-author-${node.id}`}
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    maxLength={80}
                    placeholder={t('name_placeholder')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor={`reply-body-${node.id}`} className="sr-only">{t('comment_label')}</label>
                  <textarea
                    id={`reply-body-${node.id}`}
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    required
                    maxLength={4000}
                    rows={3}
                    placeholder={t('comment_placeholder')}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" disabled={isSubmitting} className="px-3 py-1 rounded-md bg-primary text-primary-foreground disabled:opacity-50">
                    {isSubmitting ? t('posting') : t('post')}
                  </button>
                  <button type="button" className="px-3 py-1 rounded-md border" onClick={() => setReplyTo(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <p className="whitespace-pre-wrap leading-relaxed">{node.body}</p>
            {renderBranch(node.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return renderBranch(null, 0);
}
