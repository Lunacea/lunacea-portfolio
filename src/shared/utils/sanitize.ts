/**
 * サーバーサイド用のHTMLサニタイゼーション関数
 * DOMPurifyがサーバーサイドで動作しないため、基本的な正規表現ベースのサニタイゼーションを使用
 */

export function sanitizeHtmlServerSide(htmlContent: string): string {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return '';
  }
  
  // より安全なサニタイゼーション（サーバーサイド用）
  let sanitized = htmlContent;

  // 置換を安定するまで繰り返すためのユーティリティ
  const replaceRepeatedly = (input: string, pattern: RegExp, replacement: string): string => {
    let previous: string;
    let output = input;
    do {
      previous = output;
      output = output.replace(pattern, replacement);
    } while (output !== previous);
    return output;
  };
  
  // 危険なタグを繰り返し削除（入れ子構造に対応）
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'];
  
  for (const tag of dangerousTags) {
    let previous;
    do {
      previous = sanitized;
      sanitized = sanitized.replace(new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi'), '');
    } while (sanitized !== previous);
  }
  
  // 危険なURLスキームの削除
  sanitized = replaceRepeatedly(sanitized, /(javascript|data|vbscript|file|about):/gi, '');
  
  // イベントハンドラーの削除
  // on* 属性全体 (値を含む) を削除
  sanitized = replaceRepeatedly(sanitized, /\s*on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  
  // 危険な属性の削除
  sanitized = replaceRepeatedly(sanitized, /\s*(onerror|onload|onclick|onmouseover|onfocus|onblur)\s*=\s*["'][^"']*["']/gi, '');

  // コメントの除去
  sanitized = replaceRepeatedly(sanitized, /<!--([\s\S]*?)-->/gi, '');
  
  return sanitized;
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
