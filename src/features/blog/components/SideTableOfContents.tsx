'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHeadingResolver } from '@/features/blog/hooks/useHeadingResolver';

type TableOfContentsItem = { id: string; title: string; level: number };

type SideTableOfContentsProps = { items: TableOfContentsItem[] };

export default function SideTableOfContents({ items }: SideTableOfContentsProps) {
  const topLevelItems = useMemo(() => items.filter(item => item.level <= 2), [items]);
  const [activeId, setActiveId] = useState<string>(topLevelItems[0]?.id ?? '');
  const activeIdRef = useRef<string>('');

  const { resolvedIdMap, getResolvedId, resolveElementForItem } = useHeadingResolver(topLevelItems);

  const smoothScrollToHeading = (elementId: string) => {
    const item = topLevelItems.find(it => it.id === elementId);
    const resolvedId = getResolvedId(elementId);
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

  // 解決マップの構築は useHeadingResolver が担当

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
