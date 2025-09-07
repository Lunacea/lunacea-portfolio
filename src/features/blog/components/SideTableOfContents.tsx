'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type TableOfContentsItem = { id: string; title: string; level: number };

type SideTableOfContentsProps = { items: TableOfContentsItem[] };

export default function SideTableOfContents({ items }: SideTableOfContentsProps) {
  const topLevelItems = useMemo(() => items.filter(item => item.level <= 2), [items]);
  const [activeId, setActiveId] = useState<string>(topLevelItems[0]?.id ?? '');
  const activeIdRef = useRef<string>('');

  // 見出しIDのゆらぎを吸収する解決マップ（例: "&" -> "and" / 削除 など）
  const [resolvedIdMap, setResolvedIdMap] = useState<Record<string, string>>({});

  const getIdCandidates = useCallback((rawId: string): string[] => {
    const candidates = new Set<string>();
    const add = (s: string) => { if (s) { candidates.add(s); } };
    const base = rawId;
    add(base);
    try { add(decodeURIComponent(base)); } catch { /* noop */ }
    add(base.replace(/&/g, 'and'));
    add(base.replace(/&/g, ''));
    add(base.replace(/-and-/g, '-'));
    add(base.replace(/--+/g, '-'));
    // 括弧付き注釈を除去した候補（例: （操作とスタイル））
    add(base.replace(/[（(].*?[）)]/g, '').replace(/--+/g, '-'));
    return Array.from(candidates);
  }, []);

  const resolveElementForItem = useCallback((item: TableOfContentsItem): HTMLElement | null => {
    // 1) IDの候補から探索
    for (const cand of getIdCandidates(item.id)) {
      const el = document.getElementById(cand);
      if (el) return el as HTMLElement;
    }
    // 2) タイトルから見出しをおおまかに特定（&/括弧/空白差異を許容）
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

  const smoothScrollToHeading = (elementId: string) => {
    const item = topLevelItems.find(it => it.id === elementId);
    const resolvedId = (item && resolvedIdMap[item.id]) || elementId;
    const target = document.getElementById(resolvedId) || (item ? resolveElementForItem(item) : null);
    if (!target) return;

    // より堅牢なスクロール位置の取得
    const currentPosition = window.pageYOffset || 
                          document.documentElement.scrollTop || 
                          document.body.scrollTop || 
                          0;
    
    const headerOffset = 100;
    const elementPosition = target.getBoundingClientRect().top;
    const targetPosition = elementPosition + currentPosition - headerOffset;
    const distance = targetPosition - currentPosition;
    const duration = 800; // 800ms
    let start: number | null = null;

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      const newPosition = currentPosition + distance * easedProgress;
      
      // より堅牢なスクロール方法
      try {
        // 方法1: window.scrollTo
        if (window.scrollTo) {
          window.scrollTo(0, newPosition);
        }
        // 方法2: window.scroll
        else if (window.scroll) {
          window.scroll(0, newPosition);
        }
        // 方法3: document.documentElement.scrollTop
        else {
          document.documentElement.scrollTop = newPosition;
        }
      } catch {
        // エラーが発生した場合は静かに処理
      }

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const updateActiveId = useCallback(() => {
    if (!topLevelItems || topLevelItems.length === 0) {
      return;
    }
    const headings = topLevelItems
      .map(item => {
        const resolved = resolvedIdMap[item.id] || item.id;
        return document.getElementById(resolved) || resolveElementForItem(item);
      })
      .filter(Boolean) as HTMLElement[];
    let foundActiveId = '';
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 120) {
          foundActiveId = heading.id;
          break;
        }
      }
    }
    if (foundActiveId && activeIdRef.current !== foundActiveId) {
      activeIdRef.current = foundActiveId;
      requestAnimationFrame(() => {
        setActiveId(foundActiveId);
      });
    }
  }, [topLevelItems, resolvedIdMap, resolveElementForItem]);

  useEffect(() => {
    if (!topLevelItems || topLevelItems.length === 0) {
      return;
    }
    window.addEventListener('scroll', updateActiveId, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateActiveId);
    };
  }, [topLevelItems, updateActiveId]);

  // 初期レンダリング後に見出しIDのゆらぎを解決してマップ化
  useEffect(() => {
    const map: Record<string, string> = {};
    for (const item of topLevelItems) {
      const el = resolveElementForItem(item);
      if (el) {
        map[item.id] = el.id;
      }
    }
    // 差分がない場合は更新しない
    const prev = resolvedIdMap;
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(map);
    const sameLength = prevKeys.length === nextKeys.length;
    const sameEntries = sameLength && nextKeys.every(k => prev[k] === map[k]);
    if (!sameEntries) {
      setResolvedIdMap(map);
    }
  }, [topLevelItems, resolveElementForItem, resolvedIdMap]);

  if (!topLevelItems || topLevelItems.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <nav className="relative py-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">On This Page</h3>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40" />
          <ul className="space-y-2 ml-4 relative">
            {topLevelItems.map((item) => {
              const resolvedForItem = resolvedIdMap[item.id] || item.id;
              const isActive = activeId === resolvedForItem;
              return (
                <li key={`side-toc-${item.id}`} className="relative">
                  {isActive && <div className="absolute -left-4 top-0 bottom-0 w-px bg-primary transition-all duration-200" />}
                  <a
                    href={`#${resolvedForItem}`}
                    className={`block py-1 text-sm leading-relaxed transition-all duration-200 hover:text-foreground ${item.level === 2 ? 'ml-4' : ''} ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      smoothScrollToHeading(item.id);
                    }}
                  >
                    {item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
