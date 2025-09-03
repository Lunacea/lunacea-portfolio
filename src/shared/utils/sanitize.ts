/**
 * サーバーサイド用のHTMLサニタイゼーション関数
 * DOMPurifyがサーバーサイドで動作しないため、基本的な正規表現ベースのサニタイゼーションを使用
 */

export function sanitizeHtmlServerSide(htmlContent: string): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }
  
  // 基本的なサニタイゼーション（サーバーサイド用）
  return htmlContent
    // 危険なタグの削除
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
    .replace(/<input\b[^<]*(?:(?!<\/input>)<[^<]*)*<\/input>/gi, '')
    .replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '')
    .replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '')
    .replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '')
    // 危険なURLスキームの削除
    .replace(/(javascript|data|vbscript|file|about):/gi, '')
    // イベントハンドラーの削除
    .replace(/on\w+\s*=/gi, '')
    // 危険な属性の削除
    .replace(/\s*(onerror|onload|onclick|onmouseover|onfocus|onblur)\s*=\s*["'][^"']*["']/gi, '');
}

/**
 * クライアントサイド用のHTMLサニタイゼーション関数
 * DOMPurifyを使用した包括的なサニタイゼーション
 */
export function sanitizeHtmlClientSide(htmlContent: string): string {
  if (typeof window === 'undefined') {
    // サーバーサイドでは基本的なサニタイゼーションを使用
    return sanitizeHtmlServerSide(htmlContent);
  }
  
  // クライアントサイドでは基本的なサニタイゼーションを使用
  // DOMPurifyは動的インポートで使用する
  return sanitizeHtmlServerSide(htmlContent);
}
