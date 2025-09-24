export const MERMAID_FENCE_REGEX = /```mermaid[^\n]*\r?\n([\s\S]*?)\r?\n```/g;

export function encodeAttr(value: string): string {
  return encodeURIComponent(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function buildSkeletonPlaceholder(encodedContent: string): string {
  return (
    `<div class="mermaid-placeholder my-6 border border-border rounded-xl bg-muted/30 p-4" data-mermaid-content="${encodedContent}">` +
      `<div class="flex items-center gap-3 mb-3">` +
        `<div class="h-4 w-24 bg-muted animate-pulse rounded" aria-hidden="true"></div>` +
        `<div class="h-4 w-12 bg-muted animate-pulse rounded" aria-hidden="true"></div>` +
      `</div>` +
      `<div class="h-[220px] w-full bg-muted animate-pulse rounded-lg" aria-label="Loading chart skeleton"></div>` +
      `<div class="sr-only" data-mermaid-content="${encodedContent}">Mermaid chart placeholder</div>` +
    `</div>`
  );
}

export function replaceFencesWithPlaceholders(source: string): string {
  return source.replace(MERMAID_FENCE_REGEX, (_m, body) => {
    const encoded = encodeAttr(String(body).trim());
    return buildSkeletonPlaceholder(encoded);
  });
}


