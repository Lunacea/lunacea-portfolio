import { useCallback, useEffect, useState } from 'react';

export type HeadingItem = { id: string; title: string; level: number };

export function useHeadingResolver<T extends HeadingItem>(items: T[]) {
  const [resolvedIdMap, setResolvedIdMap] = useState<Record<string, string>>({});

  const getIdCandidates = useCallback((rawId: string): string[] => {
    const candidates = new Set<string>();
    const add = (s: string) => { if (s) candidates.add(s); };
    add(rawId);
    try { add(decodeURIComponent(rawId)); } catch { /* noop */ }
    add(rawId.replace(/&/g, 'and'));
    add(rawId.replace(/&/g, ''));
    add(rawId.replace(/-and-/g, '-'));
    add(rawId.replace(/--+/g, '-'));
    add(rawId.replace(/[（(].*?[）)]/g, '').replace(/--+/g, '-'));
    return Array.from(candidates);
  }, []);

  const resolveElementForItem = useCallback((item: HeadingItem): HTMLElement | null => {
    for (const cand of getIdCandidates(item.id)) {
      const el = document.getElementById(cand);
      if (el) return el as HTMLElement;
    }
    const norm = (s: string) => s
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[（()）]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wanted = norm(item.title);
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];
    for (const h of headings) {
      if (norm(h.textContent || '') === wanted) return h;
    }
    return null;
  }, [getIdCandidates]);

  const buildResolvedMap = useCallback((source: HeadingItem[]) => {
    const map: Record<string, string> = {};
    for (const item of source) {
      const el = resolveElementForItem(item);
      if (el) map[item.id] = el.id;
    }
    return map;
  }, [resolveElementForItem]);

  useEffect(() => {
    setResolvedIdMap(buildResolvedMap(items));
  }, [items, buildResolvedMap]);

  const getResolvedId = useCallback((rawId: string) => resolvedIdMap[rawId] || rawId, [resolvedIdMap]);

  const smoothScrollToHeading = useCallback((elementId: string, headerOffset = 100) => {
    const item = items.find(it => it.id === elementId);
    const resolvedId = getResolvedId(elementId);
    const target = document.getElementById(resolvedId) || (item ? resolveElementForItem(item) : null);
    if (!target) return;

    const currentPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const elementPosition = target.getBoundingClientRect().top;
    const targetPosition = elementPosition + currentPosition - headerOffset;
    const distance = targetPosition - currentPosition;
    const duration = 800;
    let start: number | null = null;

    const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const newPosition = currentPosition + distance * eased;
      try {
        if (window.scrollTo) window.scrollTo(0, newPosition);
        else if (window.scroll) window.scroll(0, newPosition);
        else document.documentElement.scrollTop = newPosition;
      } catch {}
      if (progress < 1) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
  }, [items, getResolvedId, resolveElementForItem]);

  return { resolvedIdMap, getResolvedId, resolveElementForItem, smoothScrollToHeading };
}


