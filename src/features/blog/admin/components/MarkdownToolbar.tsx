
'use client';

import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { useTranslations } from 'next-intl';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code2,
  Table as TableIcon,
  Sigma,
  Workflow,
  Columns,
  FileText,
  Eye,
} from 'lucide-react';

type MarkdownToolbarProps = {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onChangeContentAction: (next: string) => void;
  onSaveDraftAction: () => void;
  onPublishAction: () => void;
  onChangeLayoutModeAction?: (mode: 'split' | 'editor' | 'preview') => void;
  disabled?: boolean;
  currentLayoutMode?: 'split' | 'editor' | 'preview';
  className?: string;
};

function getSelection(textarea: HTMLTextAreaElement) {
  return {
    value: textarea.value,
    start: textarea.selectionStart || 0,
    end: textarea.selectionEnd || 0,
  };
}

function setSelection(textarea: HTMLTextAreaElement, start: number, end: number) {
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start, end);
  });
}

export default function MarkdownToolbar({ textareaRef, onChangeContentAction, onSaveDraftAction, onPublishAction, onChangeLayoutModeAction, disabled, currentLayoutMode, className }: MarkdownToolbarProps) {
  const t = useTranslations('BlogEditor');
  const applyWrap = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, start, end } = getSelection(ta);
    const selected = value.slice(start, end) || '';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChangeContentAction(next);
    setSelection(ta, start + before.length, start + before.length + selected.length);
  };

  const applyPrefix = (prefix: string, enumerate = false) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, start, end } = getSelection(ta);
    const before = value.lastIndexOf('\n', start - 1) + 1;
    const after = value.indexOf('\n', end);
    const sliceEnd = after === -1 ? value.length : after;
    const block = value.slice(before, sliceEnd);
    const lines = block.split('\n');
    const nextLines = lines.map((line, idx) => enumerate ? `${idx + 1}. ${line}` : `${prefix}${line}`);
    const replaced = nextLines.join('\n');
    const next = value.slice(0, before) + replaced + value.slice(sliceEnd);
    onChangeContentAction(next);
    const delta = (enumerate ? 3 : prefix.length) * lines.length;
    setSelection(ta, start + (enumerate ? 3 : prefix.length), end + delta);
  };

  const insertBlock = (block: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { value, start, end } = getSelection(ta);
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const insertion = `${(lineStart === 0 ? '' : '\n') + block  }\n`;
    const next = value.slice(0, lineStart) + insertion + value.slice(end);
    onChangeContentAction(next);
    const caret = lineStart + insertion.length;
    setSelection(ta, caret, caret);
  };

  return (
    <div role="toolbar" aria-label="Markdown editor toolbar" className={`flex flex-col gap-2 sticky top-12 md:top-14 lg:top-16 z-30 border-b backdrop-blur px-2 py-2 focus-within:ring-1 focus-within:ring-primary/20 ${className || ''}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap bg-card/95 shadow-sm">
        <div role="group" aria-label="Text formatting" className="flex items-center gap-1 flex-wrap">
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.bold')} title={t('toolbar.tooltips.bold')} onClick={() => applyWrap('**', '**')}>
            <Bold className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.bold')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.italic')} title={t('toolbar.tooltips.italic')} onClick={() => applyWrap('*', '*')}>
            <Italic className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.italic')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.strikethrough')} title={t('toolbar.tooltips.strikethrough')} onClick={() => applyWrap('~~', '~~')}>
            <Strikethrough className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.strikethrough')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.inline_code')} title={t('toolbar.tooltips.inline_code')} onClick={() => applyWrap('`', '`')}>
            <Code className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.inline_code')}</span>
          </Button>
          <span aria-hidden className="mx-1 h-4 w-px bg-border" />
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.heading_1')} title={t('toolbar.tooltips.heading_1')} onClick={() => applyPrefix('# ')}>
            <Heading1 className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.heading_1')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.heading_2')} title={t('toolbar.tooltips.heading_2')} onClick={() => applyPrefix('## ')}>
            <Heading2 className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.heading_2')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.heading_3')} title={t('toolbar.tooltips.heading_3')} onClick={() => applyPrefix('### ')}>
            <Heading3 className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.heading_3')}</span>
          </Button>
          <span aria-hidden className="mx-1 h-4 w-px bg-border" />
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.unordered_list')} title={t('toolbar.tooltips.unordered_list')} onClick={() => applyPrefix('- ')}>
            <List className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.unordered_list')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.ordered_list')} title={t('toolbar.tooltips.ordered_list')} onClick={() => applyPrefix('', true)}>
            <ListOrdered className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.ordered_list')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.checklist')} title={t('toolbar.tooltips.checklist')} onClick={() => applyPrefix('- [ ] ')}>
            <ListTodo className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.checklist')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.blockquote')} title={t('toolbar.tooltips.blockquote')} onClick={() => applyPrefix('> ')}>
            <Quote className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.blockquote')}</span>
          </Button>
          <span aria-hidden className="mx-1 h-4 w-px bg-border" />
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.link')} title={t('toolbar.tooltips.link')} onClick={() => insertBlock('[text](https://)')}>
            <LinkIcon className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.link')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.image')} title={t('toolbar.tooltips.image')} onClick={() => insertBlock('![alt](https://)')}>
            <ImageIcon className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.image')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.code_block')} title={t('toolbar.tooltips.code_block')} onClick={() => insertBlock('```ts\n// code\n```')}>
            <Code2 className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.code_block')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.table')} title={t('toolbar.tooltips.table')} onClick={() => insertBlock('| col1 | col2 |\n| --- | --- |\n| val1 | val2 |')}>
            <TableIcon className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.table')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.mermaid')} title={t('toolbar.tooltips.mermaid')} onClick={() => insertBlock('```mermaid\ngraph TD;\n  A-->B;\n```')}>
            <Workflow className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.mermaid')}</span>
          </Button>
          <Button type="button" variant="ghost" size="sm" aria-label={t('toolbar.math')} title={t('toolbar.tooltips.math')} onClick={() => applyWrap('$', '$')}>
            <Sigma className="h-4 w-4" />
            <span className="sr-only">{t('toolbar.math')}</span>
          </Button>
        </div>
      </div>
      <div className="h-px border-b border-border" />
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {onChangeLayoutModeAction && (
            <div role="group" aria-label="Layout" className="flex items-center gap-1 mr-2">
              <Button type="button" variant={currentLayoutMode === 'split' ? 'default' : 'ghost'} size="sm" aria-label={t('toolbar.split_view')} title={t('toolbar.tooltips.split_view')} aria-pressed={currentLayoutMode === 'split'} onClick={() => onChangeLayoutModeAction('split')}>
                <Columns className="h-4 w-4" />
                <span className="sr-only">{t('toolbar.split_view')}</span>
              </Button>
              <Button type="button" variant={currentLayoutMode === 'editor' ? 'default' : 'ghost'} size="sm" aria-label={t('toolbar.editor_only')} title={t('toolbar.tooltips.editor_only')} aria-pressed={currentLayoutMode === 'editor'} onClick={() => onChangeLayoutModeAction('editor')}>
                <FileText className="h-4 w-4" />
                <span className="sr-only">{t('toolbar.editor_only')}</span>
              </Button>
              <Button type="button" variant={currentLayoutMode === 'preview' ? 'default' : 'ghost'} size="sm" aria-label={t('toolbar.preview_only')} title={t('toolbar.tooltips.preview_only')} aria-pressed={currentLayoutMode === 'preview'} onClick={() => onChangeLayoutModeAction('preview')}>
                <Eye className="h-4 w-4" />
                <span className="sr-only">{t('toolbar.preview_only')}</span>
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={onSaveDraftAction} disabled={disabled} aria-label={t('save_draft')} title={t('save_draft')} className="flex flex-col items-center h-auto py-1">
              <FileText className="h-4 w-4" />
              <span className="text-[10px] leading-tight">{t('save_draft')}</span>
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onPublishAction} disabled={disabled} aria-label={t('publish')} title={t('publish')} className="flex flex-col items-center h-auto py-1 hover:bg-accent hover:text-accent-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-[10px] leading-tight">{t('publish')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


