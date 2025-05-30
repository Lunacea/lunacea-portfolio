'use client';

import { useEffect, useState } from 'react';

type TableOfContentsItem = {
  id: string;
  title: string;
  level: number;
};

type SideTableOfContentsProps = {
  items: TableOfContentsItem[];
};

export function SideTableOfContents({ items }: SideTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  // トップレベルヘディング（H1またはH2）のみフィルタリング
  const topLevelItems = items.filter(item => item.level <= 2);

  useEffect(() => {
    if (!topLevelItems || topLevelItems.length === 0) {
      return;
    }

    const handleScroll = () => {
      // 現在表示されている見出しを特定
      const headings = topLevelItems
        .map(item => document.getElementById(item.id))
        .filter(Boolean);

      let foundActiveId = '';
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading) {
          const rect = heading.getBoundingClientRect();
          // ヘッダーの高さを考慮して、少し上の位置でアクティブ判定
          if (rect.top <= 120) {
            foundActiveId = heading.id;
            break;
          }
        }
      }
      setActiveId(foundActiveId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // 初期化

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [topLevelItems]);

  if (!topLevelItems || topLevelItems.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <nav className="relative py-4">
        {/* 見出し */}
        <h3 className="text-sm font-semibold text-foreground mb-4 tracking-tight">
          On This Page
        </h3>

        {/* 目次リスト */}
        <div className="relative">
          {/* 左側の縦線 */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border/40"></div>

          <ul className="space-y-2 ml-4 relative">
            {topLevelItems.map((item, index) => {
              const isActive = activeId === item.id;

              return (
                <li key={`side-toc-${index}-${item.id}`} className="relative">
                  {/* アクティブアイテムの左線ハイライト */}
                  {isActive && (
                    <div className="absolute -left-4 top-0 bottom-0 w-px bg-primary transition-all duration-200"></div>
                  )}

                  <a
                    href={`#${item.id}`}
                    className={`block py-1 text-sm leading-relaxed transition-all duration-200 hover:text-foreground ${
                      item.level === 2 ? 'ml-4' : ''
                    } ${
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(item.id);
                      if (target) {
                        // ヘッダーの高さを考慮したスムーズスクロール
                        const headerOffset = 100;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth',
                        });
                      }
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
