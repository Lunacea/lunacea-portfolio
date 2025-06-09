'use client';

import { useLayoutEffect } from 'react';

type ScrollControllerProps = {
  disableScroll?: boolean;
};

export const ScrollController = ({ disableScroll = true }: ScrollControllerProps) => {
  useLayoutEffect(() => {
    if (typeof window === 'undefined' || !disableScroll) {
      return;
    }

    // 縦スクロールを阻止するイベントハンドラー
    const preventVerticalScroll = (e: WheelEvent) => {
      // 縦方向のスクロールのみ阻止（deltaYが0でない場合）
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
      }
    };

    // タッチスクロールを阻止するイベントハンドラー
    const preventTouchScroll = (e: TouchEvent) => {
      // タッチイベントでの縦スクロールを阻止
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    };

    // キーボードスクロールを阻止するイベントハンドラー
    const preventKeyboardScroll = (e: KeyboardEvent) => {
      // 縦スクロールに関連するキーのみ阻止
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'];
      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    // イベントリスナーを追加
    window.addEventListener('wheel', preventVerticalScroll, { passive: false });
    window.addEventListener('touchmove', preventTouchScroll, { passive: false });
    window.addEventListener('keydown', preventKeyboardScroll, { passive: false });

    // クリーンアップ関数
    return () => {
      window.removeEventListener('wheel', preventVerticalScroll);
      window.removeEventListener('touchmove', preventTouchScroll);
      window.removeEventListener('keydown', preventKeyboardScroll);
    };
  }, [disableScroll]);

  return null; // レンダリングなし
};
