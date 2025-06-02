'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaList } from 'react-icons/fa';
import Icon from '@/components/Icon';

type TableOfContentsItem = {
  id: string;
  title: string;
  level: number;
};

type StickyTableOfContentsProps = {
  items: TableOfContentsItem[];
};

export function StickyTableOfContents({ items }: StickyTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
  const activeIdRef = useRef<string>('');

  // アクティブな見出しを更新する関数をメモ化
  const updateActiveId = useCallback(() => {
    if (!items || items.length === 0) {
      return;
    }

    // 現在表示されている見出しを特定
    const headings = items.map(item => document.getElementById(item.id)).filter(Boolean);

    let foundActiveId = '';
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading) {
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          foundActiveId = heading.id;
          break;
        }
      }
    }

    // 現在のactiveIdと異なる場合のみ更新
    if (activeIdRef.current !== foundActiveId) {
      activeIdRef.current = foundActiveId;
      requestAnimationFrame(() => {
        setActiveId(foundActiveId);
      });
    }
  }, [items]);

  useEffect(() => {
    if (!items || items.length === 0) {
      return;
    }

    window.addEventListener('scroll', updateActiveId);

    return () => window.removeEventListener('scroll', updateActiveId);
  }, [items, updateActiveId]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-4">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Icon icon={<FaList />} className="text-primary text-sm" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">目次</h3>
        </div>

        {/* 目次リスト */}
        <nav>
          <ul className="space-y-1">
            {items.map(item => (
              <li
                key={`sticky-toc-${item.id}`}
                className={`${item.level > 1 ? `ml-${(item.level - 1) * 3}` : ''}`}
              >
                <a
                  href={`#${item.id}`}
                  className={`block py-1.5 px-2 text-xs leading-relaxed rounded-lg transition-all duration-200 border-l-2 ${
                    activeId === item.id
                      ? 'text-primary bg-primary/5 border-primary font-medium'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(item.id);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
