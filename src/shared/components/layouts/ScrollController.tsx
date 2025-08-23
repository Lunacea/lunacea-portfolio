'use client';

import { useLayoutEffect } from 'react';

type ScrollControllerProps = {
  disableScroll?: boolean;
};

export default function ScrollController({ disableScroll = true }: ScrollControllerProps) {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !disableScroll) {
      return;
    }

    const preventVerticalScroll = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
      }
    };

    const preventTouchScroll = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    };

    const preventKeyboardScroll = (e: KeyboardEvent) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventVerticalScroll, { passive: false });
    window.addEventListener('touchmove', preventTouchScroll, { passive: false });
    window.addEventListener('keydown', preventKeyboardScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventVerticalScroll);
      window.removeEventListener('touchmove', preventTouchScroll);
      window.removeEventListener('keydown', preventKeyboardScroll);
    };
  }, [disableScroll]);

  return null;
}
