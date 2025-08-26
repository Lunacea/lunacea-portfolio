'use client';

import { FiChevronUp } from 'react-icons/fi';

export default function BackToTop() {
  const scrollToTop = () => {
    smoothScrollToTop();
  };

  const smoothScrollToTop = () => {
    // より堅牢なスクロール位置の取得
    const currentPosition = window.pageYOffset || 
                          document.documentElement.scrollTop || 
                          document.body.scrollTop || 
                          0;
    
    if (currentPosition <= 0) {
      return;
    }

    const targetPosition = 0;
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <div className="text-center py-8 border-t border-border/30">
      <button
        type="button"
        onClick={scrollToTop}
        onKeyDown={handleKeyDown}
        className="group flex flex-col items-center gap-1 mx-auto text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-within:text-foreground focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 focus-within:ring-offset-background transition-all duration-200 rounded-md p-2 hover:bg-card/50 focus-within:bg-card/50"
        aria-label="ページの一番上に戻る"
        title="ページの一番上に戻る"
      >
        <FiChevronUp 
          className="w-6 h-6 group-hover:translate-y-[-2px] group-focus-within:translate-y-[-2px] transition-transform duration-200" 
          aria-hidden="true"
        />
        <span className="text-sm">Back to Top</span>
        <span className="sr-only">ページの一番上に戻る</span>
      </button>
    </div>
  );
}
