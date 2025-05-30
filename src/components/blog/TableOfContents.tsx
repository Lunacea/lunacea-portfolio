'use client';

import { faChevronDown, faChevronUp, faList } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Icon } from '@/components/Icon';

type TableOfContentsItem = {
  id: string;
  title: string;
  level: number;
};

type TableOfContentsProps = {
  items: TableOfContentsItem[];
  className?: string;
};

export function TableOfContents({ items, className = '' }: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // トップレベルヘディング（H1またはH2）のみフィルタリング
  const topLevelItems = items.filter(item => item.level <= 2);

  if (!topLevelItems || topLevelItems.length === 0) {
    return null;
  }

  return (
    <div className={`bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 ${className}`}>
      {/* ヘッダー */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors duration-200 rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Icon icon={faList} className="text-primary text-sm" />
          </div>
          <h3 className="font-semibold text-foreground">目次</h3>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            {topLevelItems.length}
          </span>
        </div>
        <Icon
          icon={isExpanded ? faChevronUp : faChevronDown}
          className="text-muted-foreground transition-transform duration-200"
        />
      </button>

      {/* 目次リスト */}
      {isExpanded && (
        <div className="p-4 pt-0 max-h-96 overflow-y-auto">
          <ul className="space-y-1">
            {topLevelItems.map((item, index) => (
              <li
                key={`toc-${index}-${item.id}`}
                className={`${item.level === 2 ? 'ml-4' : ''}`}
              >
                <a
                  href={`#${item.id}`}
                  className="block py-2 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 leading-relaxed"
                  onClick={(e) => {
                    e.preventDefault();
                    // スムーズスクロール
                    const target = document.getElementById(item.id);
                    if (target) {
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
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
