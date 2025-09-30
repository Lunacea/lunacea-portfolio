import { logger } from '@/shared/libs/Logger';

/**
 * タイトルからスラッグを生成
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 特殊文字を除去
    .replace(/\s+/g, '-') // スペースをハイフンに
    .replace(/-+/g, '-') // 連続するハイフンを1つに
    .replace(/^-+|-+$/g, ''); // 先頭・末尾のハイフンを除去
}

/**
 * コンテンツから抜粋を生成
 */
export function generateExcerpt(content: string): string {
  // Markdownの見出し記号を除去
  const cleanContent = content
    .replace(/^#+\s/gm, '') // 見出し記号を除去
    .replace(/[#*_`~[\]]/g, '') // その他のMarkdown記号を除去
    .replace(/!\[.*?\]\(.*?\)/g, '') // 画像を除去
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンクテキストのみ残す
    .replace(/\s+/g, ' ') // 連続するスペースを1つに
    .trim();

  // 200文字で切り取り
  return cleanContent.length > 200 
    ? `${cleanContent.substring(0, 200)}...` 
    : cleanContent;
}

/**
 * 読了時間を計算（分単位）
 */
export function calculateReadingTime(content: string): number {
  // 日本語は1分間に400文字、英語は200単語として計算
  const japaneseChars = (content.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length;
  const englishWords = content.replace(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '').split(/\s+/).length;
  
  const japaneseTime = japaneseChars / 400;
  const englishTime = englishWords / 200;
  
  return Math.max(1, Math.ceil(japaneseTime + englishTime));
}

/**
 * タグの配列を正規化
 */
export function normalizeTags(tagsString: string): string[] {
  try {
    return JSON.parse(tagsString || '[]');
  } catch {
    logger.warn({ tagsString }, 'タグのJSONパースに失敗、空配列を返します');
    return [];
  }
}

/**
 * エラーレスポンスの共通形式
 */
export interface ErrorResponse {
  success: false;
  error: string;
}

/**
 * 成功レスポンスの共通形式
 */
export interface SuccessResponse<T = void> {
  success: true;
  data?: T;
}

/**
 * 共通のAPIレスポンス型
 */
export type ApiResponse<T = void> = SuccessResponse<T> | ErrorResponse;
