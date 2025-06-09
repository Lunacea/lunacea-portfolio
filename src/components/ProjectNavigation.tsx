'use client';

import { useCallback, useEffect, useRef } from 'react';

type ProjectNavigationProps = {
  projectCount: number;
  currentProject: number;
  onProjectChangeAction: (index: number) => void;
};

export function ProjectNavigation({
  projectCount,
  currentProject,
  onProjectChangeAction,
}: ProjectNavigationProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!e.touches || e.touches.length === 0) {
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
    if (!touchStartRef.current || !e.changedTouches || e.changedTouches.length === 0) {
      return;
    }

    const touch = e.changedTouches[0];
    if (touch) {
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // 水平方向のスワイプを検出（最小50px、垂直方向より大きい）
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        const direction = deltaX > 0 ? -1 : 1; // 右スワイプで前に戻る、左スワイプで次に進む
        const newIndex = (currentProject + direction + projectCount) % projectCount;
        onProjectChangeAction(newIndex);
      }
    }

    touchStartRef.current = null;
  }, [currentProject, projectCount, onProjectChangeAction]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) {
      return;
    }

    nav.addEventListener('touchstart', handleTouchStart, { passive: true });
    nav.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      nav.removeEventListener('touchstart', handleTouchStart);
      nav.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd]);

  return (
    <div className="flex justify-center py-6">
      <nav ref={navRef} className="relative">
        {/* ナビゲーション */}
        <div className="relative">
          {/* 下の横線 */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-border/40"></div>

          <div className="flex items-center gap-6 pt-4 relative">
            {Array.from({ length: projectCount }, (_, index) => {
              const isActive = currentProject === index;

              return (
                <div key={`project-nav-${index}`} className="relative">
                  {/* アクティブアイテムの上線ハイライト */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-primary transition-all duration-200"></div>
                  )}

                  <button
                    type="button"
                    onClick={() => onProjectChangeAction(index)}
                    className={`block py-2 text-sm leading-relaxed transition-all duration-200 hover:text-foreground ${
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                    aria-label={`プロジェクト ${index + 1}に移動`}
                  >
                    #
                    {String(index + 1).padStart(3, '0')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
