'use client';

import { useCallback, useMemo, useState } from 'react';
import { FaChevronUp, FaList } from 'react-icons/fa';
import Icon from '@/components/Icon';

type TableOfContentsItem = {
  id: string;
  title: string;
  level: number;
};

type TableOfContentsProps = {
  items: TableOfContentsItem[];
  className?: string;
  /** 表示する見出しレベルの最大値 (デフォルト: 3) */
  maxLevel?: number;
  /** 初期状態で展開するかどうか (デフォルト: false) */
  defaultExpanded?: boolean;
};

export function TableOfContents({
  items,
  className = '',
  maxLevel = 3,
  defaultExpanded = false,
}: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // 指定レベル以下の見出しをフィルタリング（メモ化）
  const filteredItems = useMemo(() => {
    return items.filter(item => item.level <= maxLevel && item.level >= 1);
  }, [items, maxLevel]);

  // スムーズスクロール処理（メモ化）
  const handleScrollToHeading = useCallback((elementId: string) => {
    const target = document.getElementById(elementId);
    if (target) {
      const headerOffset = 100; // ヘッダーの高さを考慮
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  // 項目がない場合は非表示
  if (!filteredItems || filteredItems.length === 0) {
    return null;
  }

  return (
    <nav
      className={`bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 ${className}`}
      role="navigation"
      aria-label="記事の目次"
    >
      {/* ヘッダー */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors duration-200 rounded-t-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-controls="table-of-contents-list"
        aria-label={isExpanded ? '目次を閉じる' : '目次を開く'}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <Icon icon={<FaList />} className="text-primary text-sm" />
          </div>
          <h3 className="font-semibold text-foreground">目次</h3>
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
            {filteredItems.length}
          </span>
        </div>
        <Icon
          icon={<FaChevronUp />}
          className="text-muted-foreground transition-transform duration-200"
          aria-hidden="true"
        />
      </button>

      {/* 目次リスト */}
      {isExpanded && (
        <div
          id="table-of-contents-list"
          className="p-4 pt-0 max-h-96 overflow-y-auto"
        >
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              // インデントレベルを計算（レベル1は0、レベル2は4、レベル3は8...）
              const indentClass = item.level > 1 ? `ml-${(item.level - 1) * 4}` : '';

              return (
                <li
                  key={item.id}
                  className={indentClass}
                >
                  <a
                    href={`#${item.id}`}
                    className="block py-2 px-3 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-primary/5"
                    onClick={(e) => {
                      e.preventDefault();
                      handleScrollToHeading(item.id);
                    }}
                    title={`${item.title}へ移動`}
                  >
                    <span className="line-clamp-2">
                      {item.title}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
