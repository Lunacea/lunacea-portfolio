'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const commentFormSchema = z.object({
  author: z.string().max(80).optional(),
  body: z.string().min(1, 'コメントを入力してください').max(4000, 'コメントは4000文字以内で入力してください'),
});

type CommentFormData = z.infer<typeof commentFormSchema>;

type CommentFormProps = {
  onSubmit: (data: CommentFormData) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<CommentFormData>;
  submitLabel?: string;
  cancelLabel?: string;
};

export const CommentForm = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
  submitLabel,
  cancelLabel,
}: CommentFormProps) => {
  const t = useTranslations('Comments');
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: CommentFormData) => {
    const result = await onSubmit(data);
    if (result.success) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div>
        <label htmlFor="comment-author" className="block text-sm mb-1">
          {t('name_label')}
        </label>
        <input
          id="comment-author"
          {...register('author')}
          maxLength={80}
          placeholder={t('name_placeholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          aria-describedby={errors.author ? 'author-error' : undefined}
        />
        {errors.author && (
          <p id="author-error" className="text-sm text-destructive mt-1">
            {errors.author.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="comment-body" className="block text-sm mb-1">
          {t('comment_label')}
        </label>
        <textarea
          id="comment-body"
          {...register('body')}
          required
          maxLength={4000}
          rows={4}
          placeholder={t('comment_placeholder')}
          className="w-full rounded-md border border-border bg-background px-3 py-2"
          aria-describedby={errors.body ? 'body-error' : undefined}
        />
        {errors.body && (
          <p id="body-error" className="text-sm text-destructive mt-1">
            {errors.body.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('posting') : submitLabel || t('post')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-md border hover:bg-muted transition-colors"
          >
            {cancelLabel || 'Cancel'}
          </button>
        )}
      </div>
    </form>
  );
};
