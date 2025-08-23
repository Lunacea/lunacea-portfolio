'use client';

import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

type ScrollHintProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

export default function ScrollHint({ containerRef }: ScrollHintProps) {
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = hintRef.current;
    const container = containerRef.current;
    if (!element || !container) {
      return;
    }

    let fadeTimeout: NodeJS.Timeout | null = null;
    let showTimeout: NodeJS.Timeout | null = null;
    let isPositioned = false;
    let isVisible = false;
    let hasScrolledBeforeShow = false;

    const setPosition = () => {
      if (!container) {
        return;
      }
      const containerRect = container.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;
      element.style.left = `${containerCenterX}px`;
      element.style.transform = 'translateX(-50%)';

      if (!isPositioned) {
        isPositioned = true;
        if (window.scrollY > 50) {
          hasScrolledBeforeShow = true;
          return;
        }
        showTimeout = setTimeout(() => {
          if (element && !isVisible && !hasScrolledBeforeShow && window.scrollY <= 50) {
            element.style.opacity = '1';
            isVisible = true;
          }
        }, 3000);
      }
    };

    const handleScroll = () => {
      if (!isVisible && !hasScrolledBeforeShow) {
        hasScrolledBeforeShow = true;
        if (showTimeout) {
          clearTimeout(showTimeout);
          showTimeout = null;
        }
        return;
      }
      if (!isVisible) {
        return;
      }
      setPosition();
      if (window.scrollY > 50 && element.style.display !== 'none') {
        element.style.opacity = '0';
        fadeTimeout = setTimeout(() => {
          element.style.display = 'none';
        }, 300);
      }
    };

    setPosition();
    window.addEventListener('resize', setPosition);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', setPosition);
      if (fadeTimeout) {
        clearTimeout(fadeTimeout);
      }
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [containerRef]);

  return (
    <div
      ref={hintRef}
      className="fixed bottom-8 z-50 pointer-events-none opacity-0 transition-opacity duration-300 ease-out"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-2 animate-pulse">
        <div className="text-xs text-muted-foreground/70 font-light">Scroll down</div>
        <div className="animate-bounce">
          <FiChevronDown className="w-6 h-6 text-muted-foreground/70" />
        </div>
      </div>
    </div>
  );
}
