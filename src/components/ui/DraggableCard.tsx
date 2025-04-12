'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { createDraggable } from 'animejs';
import { useEffect, useRef } from 'react';

/**
 * ドラッグ可能なカードコンポーネント
 * ユーザーがマウスやタッチでカードを自由に移動させることができます
 * @param props - カードのプロパティ
 * @param props.title - カードのタイトル
 * @param props.description - カードの説明文
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

    // 現在のカード要素への参照を保存
    const currentCard = cardRef.current;

    // 画面の中央下部に初期配置
    const positionCardInitially = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (currentCard) {
        const elementWidth = currentCard.offsetWidth;
        const elementHeight = currentCard.offsetHeight;

        currentCard.style.left = `${(viewportWidth - elementWidth) - 4}px`;
        currentCard.style.top = `${(viewportHeight - elementHeight) - 4}px`;
      }
    };

    positionCardInitially();

    // ドラッグ機能の設定
    const draggable = createDraggable(currentCard, {
      container: '.draggable-field',
      releaseContainerFriction: 1,
      onGrab: () => {
        if (currentCard) {
          currentCard.style.cursor = 'grabbing';
          currentCard.style.zIndex = '100';
        }
      },
      onRelease: () => {
        if (currentCard) {
          currentCard.style.cursor = 'grab';
        }
      },
    });

    // イベント伝播を防止する関数
    const preventPropagation = (e: MouseEvent) => {
      e.stopPropagation();
    };

    currentCard.addEventListener('mousedown', preventPropagation);
    currentCard.addEventListener('click', preventPropagation);

    // クリーンアップ
    return () => {
      draggable.revert();
      currentCard.removeEventListener('mousedown', preventPropagation);
      currentCard.removeEventListener('click', preventPropagation);
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
