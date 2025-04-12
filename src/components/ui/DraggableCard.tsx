'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { createDraggable } from 'animejs';
import { useEffect, useRef } from 'react';

/**
 * ドラッグ可能なカードコンポーネント
 * ユーザーがマウスやタッチでカードを自由に移動させることができます
 * @param props.title カードのタイトル
 * @param props.description カードの説明文
 */
const DraggableCard = (props: {
  title: string;
  description: string;
}) => {
  // カード要素への参照
  const cardRef = useRef<HTMLDivElement>(null);

  // ドラッグ機能の初期化
  useEffect(() => {
    if (!cardRef.current) {
      return;
    }

    // 画面の中央下部に初期配置
    const positionCardInitially = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (cardRef.current) {
        const elementWidth = cardRef.current.offsetWidth;
        const elementHeight = cardRef.current.offsetHeight;

        cardRef.current.style.left = `${(viewportWidth - elementWidth) - 4}px`;
        cardRef.current.style.top = `${(viewportHeight - elementHeight) - 4}px`;
      }
    };

    positionCardInitially();

    // ドラッグ機能の設定
    const draggable = createDraggable(cardRef.current, {
      container: '.draggable-field',
      releaseContainerFriction: 1,
      onGrab: () => {
        if (cardRef.current) {
          cardRef.current.style.cursor = 'grabbing';
          cardRef.current.style.zIndex = '100';
        }
      },
      onRelease: () => {
        if (cardRef.current) {
          cardRef.current.style.cursor = 'grab';
        }
      },
    });

    // イベント伝播を防止する関数
    const preventPropagation = (e: MouseEvent) => {
      e.stopPropagation();
    };

    cardRef.current.addEventListener('mousedown', preventPropagation);
    cardRef.current.addEventListener('click', preventPropagation);

    // クリーンアップ
    return () => {
      draggable.revert();
      if (cardRef.current) {
        cardRef.current.removeEventListener('mousedown', preventPropagation);
        cardRef.current.removeEventListener('click', preventPropagation);
      }
    };
  }, []);

  return (
    <div className="h-full w-full inset-0 draggable-field z-1">
      <div
        ref={cardRef}
        className="cursor-grab touch-none pointer-events-auto"
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        role="button"
        tabIndex={0}
        aria-label="ドラッグ可能なカード"
      >
        <Card className="w-[280px] shadow-lg">
          <CardHeader>
            <CardTitle>{props.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{props.description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DraggableCard;
