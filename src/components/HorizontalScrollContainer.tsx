'use client';

import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

type HorizontalScrollContainerProps = {
  children: React.ReactNode[];
  onScroll?: (scrollProgress: number, currentIndex: number) => void;
  itemCount: number;
};

export type HorizontalScrollContainerRef = {
  scrollToIndex: (index: number) => void;
};

export const HorizontalScrollContainer = ({ ref, children, onScroll, itemCount }: HorizontalScrollContainerProps & { ref?: React.RefObject<HorizontalScrollContainerRef | null> }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTransitioningRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    if (isTransitioningRef.current) {
      return;
    }

    const normalizedIndex = ((index % itemCount) + itemCount) % itemCount;
    setCurrentIndex(normalizedIndex);
    onScroll?.(normalizedIndex / (itemCount - 1), normalizedIndex);

    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, [itemCount, onScroll]);

  useImperativeHandle(ref, () => ({
    scrollToIndex,
  }), [scrollToIndex]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (isTransitioningRef.current) {
      return;
    }

    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = (currentIndex + direction + itemCount) % itemCount;

    scrollToIndex(newIndex);
  }, [scrollToIndex, itemCount, currentIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isTransitioningRef.current) {
      return;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newIndex = (currentIndex - 1 + itemCount) % itemCount;
      scrollToIndex(newIndex);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newIndex = (currentIndex + 1) % itemCount;
      scrollToIndex(newIndex);
    }
  }, [scrollToIndex, itemCount, currentIndex]);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    if (!target) {
      return;
    }

    // スクロール方向を検出
    const scrollDelta = target.scrollTop || target.scrollLeft;
    if (Math.abs(scrollDelta) > 10) {
      const direction = scrollDelta > 0 ? 1 : -1;
      const newIndex = (currentIndex + direction + itemCount) % itemCount;
      scrollToIndex(newIndex);

      // スクロール位置をリセット
      target.scrollTop = 0;
      target.scrollLeft = 0;
    }
  }, [scrollToIndex, itemCount, currentIndex]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (isTransitioningRef.current || !e.touches || e.touches.length === 0) {
      return;
    }

    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (isTransitioningRef.current || !touchStartRef.current || !e.changedTouches || e.changedTouches.length === 0) {
      return;
    }

    const touch = e.changedTouches[0];
    if (touch) {
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // 水平方向のスワイプを検出（最小50px、垂直方向より大きい）
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        const direction = deltaX > 0 ? -1 : 1; // 右スワイプで前に戻る、左スワイプで次に進む
        const newIndex = (currentIndex + direction + itemCount) % itemCount;
        scrollToIndex(newIndex);
      }
    }

    touchStartRef.current = null;
  }, [scrollToIndex, itemCount, currentIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown, handleScroll, handleTouchStart, handleTouchEnd]);

  return (
    <div className="relative w-full h-auto overflow-hidden">
      {/* カード型コンテナ - LatestUpdatesと同じスタイル */}
      <div
        ref={containerRef}
        className="h-auto backdrop-blur-[2px] bg-gradient-to-r from-background/8 to-transparent shadow-sm border-l border-border/10 relative overflow-hidden"
        data-current-index={currentIndex}
      >
        {/* 現在のアイテムのみ表示 */}
        <div className="transition-all duration-600 ease-in-out">
          {children[currentIndex]}
        </div>
      </div>
    </div>
  );
};
