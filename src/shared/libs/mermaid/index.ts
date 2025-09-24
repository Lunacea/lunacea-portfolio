export { MERMAID_FENCE_REGEX, encodeAttr, buildSkeletonPlaceholder, replaceFencesWithPlaceholders } from './core';

export function findMermaidTargets(scope: ParentNode): Element[] {
  return [
    ...scope.querySelectorAll('.mermaid-placeholder'),
    ...scope.querySelectorAll('pre code.language-mermaid'),
    ...scope.querySelectorAll('pre[data-language="mermaid"]'),
    ...scope.querySelectorAll('code.language-mermaid'),
    ...scope.querySelectorAll('.mermaid'),
  ];
}

export function pickMermaidContent(el: Element): string {
  if (el.classList.contains('mermaid-placeholder')) return el.getAttribute('data-mermaid-content') || '';
  if (el.tagName === 'CODE') return el.textContent || '';
  if (el.tagName === 'PRE') return el.querySelector('code')?.textContent || '';
  if ((el as Element).classList.contains('mermaid')) return el.textContent || '';
  return '';
}


