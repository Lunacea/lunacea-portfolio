import { useCallback, useState } from 'react';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const commentSchema = z.object({
  author: z.string().max(80).optional(),
  body: z.string().min(1).max(4000),
  parentId: z.number().int().positive().optional(),
});

type CommentFormData = z.infer<typeof commentSchema>;

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

export const useComments = (slug: string) => {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/comments?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) {
        throw new Error('failed');
      }
      const json = await res.json();
      setComments(json.data ?? []);
    } catch {
      setError('failed');
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  const createComment = async (data: CommentFormData) => {
    try {
      const res = await fetch('/api/v1/comments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug, ...data }),
      });
      if (!res.ok) {
        throw new Error('failed');
      }

      // 投稿後にコメント一覧を再取得
      await fetchComments();
      return { success: true };
    } catch {
      setError('failed');
      return { success: false, error: 'failed' };
    }
  };

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    createComment,
  };
};
