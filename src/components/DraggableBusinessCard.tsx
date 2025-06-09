'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import BusinessCard from '@/components/BusinessCard';

export function DraggableBusinessCard() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [slideRotation, setSlideRotation] = useState(0);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingPosition = useRef({ x: 0, y: 0 });
  const isAnimating = useRef(false);

  // 名刺のサイズ（max-w-mdは約384px）
  // const CARD_WIDTH = useMemo(() => 384, []);
  // const CARD_HEIGHT = useMemo(() => 200, []);

  const constrainPosition = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') {
      return { x, y, bounced: false };
    }

    // TODO: レンダリングされる名刺の中心座標をもとに移動可能な範囲を計算する
    const maxX = window.innerWidth * 0.5;
    const minX = -window.innerWidth * 0.5;
    const maxY = window.innerHeight * 0.5;
    const minY = -window.innerHeight * 0.5;

    let bounced = false;
    let newX = x;
    let newY = y;

    if (x > maxX) {
      newX = maxX;
      bounced = true;
    } else if (x < minX) {
      newX = minX;
      bounced = true;
    }

    if (y > maxY) {
      newY = maxY;
      bounced = true;
    } else if (y < minY) {
      newY = minY;
      bounced = true;
    }

    return { x: newX, y: newY, bounced };
  }, []);

  // 高FPS用のアニメーションフレーム更新
  const updatePosition = useCallback(() => {
    if (isAnimating.current) {
      const constrainedPosition = constrainPosition(pendingPosition.current.x, pendingPosition.current.y);
      setPosition({ x: constrainedPosition.x, y: constrainedPosition.y });
      isAnimating.current = false;
    }
  }, [constrainPosition]);

  const scheduleUpdate = useCallback((newX: number, newY: number) => {
    pendingPosition.current = { x: newX, y: newY };

    if (!isAnimating.current) {
      isAnimating.current = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    }
  }, [updatePosition]);

  const handleInteractionStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setSlideRotation(0);
    setVelocity({ x: 0, y: 0 });
    setLastMousePosition({ x: clientX, y: clientY });
    setLastMoveTime(Date.now());
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  }, [position]);

  const handleInteractionMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) {
      return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - lastMoveTime;

    if (deltaTime > 0) {
      const deltaX = clientX - lastMousePosition.x;
      const deltaY = clientY - lastMousePosition.y;

      const newVelocity = {
        x: deltaX / deltaTime,
        y: deltaY / deltaTime,
      };
      setVelocity(newVelocity);
    }

    setLastMousePosition({ x: clientX, y: clientY });
    setLastMoveTime(currentTime);

    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    // 高FPSのためrequestAnimationFrameで更新をスケジュール
    scheduleUpdate(newX, newY);
  }, [isDragging, dragStart, lastMousePosition, lastMoveTime, scheduleUpdate]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleInteractionStart(e.clientX, e.clientY);
  }, [handleInteractionStart]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleInteractionMove(e.clientX, e.clientY);
  }, [handleInteractionMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // e.preventDefault(); // スクロールなどのネイティブな挙動を妨げないようにコメントアウトすることも検討
    if (e.touches.length === 1) {
      handleInteractionStart(e.touches[0]!.clientX, e.touches[0]!.clientY);
    }
  }, [handleInteractionStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      handleInteractionMove(e.touches[0]!.clientX, e.touches[0]!.clientY);
    }
  }, [handleInteractionMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);

    // アニメーションフレームをクリーンアップ
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isAnimating.current = false;

    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    let rotation = 0;

    if (speed > 0.1) {
      rotation = velocity.x * 15;
      rotation = Math.max(-30, Math.min(30, rotation));
    } else {
      rotation = (Math.random() - 0.5) * 12;
    }

    setSlideRotation(rotation);

    if (speed > 0.05) {
      const inertiaDistance = speed * 100;
      const angle = Math.atan2(velocity.y, velocity.x);

      const targetX = position.x + Math.cos(angle) * inertiaDistance;
      const targetY = position.y + Math.sin(angle) * inertiaDistance;

      const constrainedTarget = constrainPosition(targetX, targetY);

      if (constrainedTarget.bounced) {
        const bounceRotation = (Math.random() - 0.5) * 20;
        setSlideRotation(rotation + bounceRotation);
      }

      setPosition({ x: constrainedTarget.x, y: constrainedTarget.y });
    }

    setTimeout(() => {
      setSlideRotation(0);
    }, 3000);
  }, [velocity, position, constrainPosition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
    }
  }, []);

  // マウスイベントリスナーの最適化
  React.useEffect(() => {
    const handleMouseMoveDocument = (e: MouseEvent) => handleMouseMove(e);
    const handleTouchMoveDocument = (e: TouchEvent) => {
      // ドラッグ中のスクロールを防ぐ
      if (isDragging) {
        e.preventDefault();
      }
      handleTouchMove(e);
    };
    const handleMouseUpDocument = () => handleMouseUp();
    const handleTouchEndDocument = () => handleMouseUp(); // handleMouseUp を共通で使う

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveDocument, { passive: true });
      document.addEventListener('mouseup', handleMouseUpDocument, { passive: true });
      document.addEventListener('touchmove', handleTouchMoveDocument, { passive: false }); // passive: false に変更
      document.addEventListener('touchend', handleTouchEndDocument, { passive: true });

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveDocument);
        document.removeEventListener('mouseup', handleMouseUpDocument);
        document.removeEventListener('touchmove', handleTouchMoveDocument);
        document.removeEventListener('touchend', handleTouchEndDocument);
        // クリーンアップ時にアニメーションフレームもキャンセル
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        isAnimating.current = false;
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const cardStyle = useMemo(() => ({
    transform: `translate3d(${position.x}px, ${position.y}px, 0) rotate(${-2 + slideRotation}deg)`,
    transition: isDragging ? 'none' : 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    willChange: isDragging ? 'transform' : 'auto',
    backfaceVisibility: 'hidden' as const,
    perspective: '1000px',
  }), [position.x, position.y, slideRotation, isDragging]);

  const cardClassName = useMemo(() => `
    bg-card/90 backdrop-blur-sm border border-border/30 rounded-2xl p-8 max-w-md w-full
    shadow-[0_8px_32px_rgba(0,0,0,0.12)]
    ${isDragging ? 'cursor-grabbing shadow-[0_16px_48px_rgba(0,0,0,0.2)]' : 'cursor-grab'}
    select-none relative
  `, [isDragging]);

  return (
    <div className="mb-16 flex justify-center">
      <div
        ref={cardRef}
        className={cardClassName}
        style={cardStyle}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="ドラッグ可能な名刺"
        onTouchStart={handleTouchStart}
      >
        <BusinessCard />
      </div>
    </div>
  );
}
