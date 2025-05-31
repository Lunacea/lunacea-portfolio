'use client';

import Image from 'next/image';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FaGraduationCap, FaMapMarkerAlt } from 'react-icons/fa';
import { SiGithub, SiMinutemailer, SiX } from 'react-icons/si';
import { Icon } from '@/components/Icon';

type DraggableBusinessCardProps = {
  locale: string;
};

export function DraggableBusinessCard({ locale: _locale }: DraggableBusinessCardProps) {
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
  const CARD_WIDTH = useMemo(() => 384, []);
  const CARD_HEIGHT = useMemo(() => 200, []);

  const constrainPosition = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') {
      return { x, y, bounced: false };
    }

    const maxX = window.innerWidth * 0.5 - CARD_WIDTH * 0.5;
    const minX = -window.innerWidth * 0.5 + CARD_WIDTH * 0.5;
    const maxY = window.innerHeight * 0.5 - CARD_HEIGHT * 0.5;
    const minY = -window.innerHeight * 0.5 + CARD_HEIGHT * 0.5;

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
  }, [CARD_WIDTH, CARD_HEIGHT]);

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setSlideRotation(0);
    setVelocity({ x: 0, y: 0 });
    setLastMousePosition({ x: e.clientX, y: e.clientY });
    setLastMoveTime(Date.now());
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) {
      return;
    }

    const currentTime = Date.now();
    const deltaTime = currentTime - lastMoveTime;

    if (deltaTime > 0) {
      const deltaX = e.clientX - lastMousePosition.x;
      const deltaY = e.clientY - lastMousePosition.y;

      const newVelocity = {
        x: deltaX / deltaTime,
        y: deltaY / deltaTime,
      };
      setVelocity(newVelocity);
    }

    setLastMousePosition({ x: e.clientX, y: e.clientY });
    setLastMoveTime(currentTime);

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // 高FPSのためrequestAnimationFrameで更新をスケジュール
    scheduleUpdate(newX, newY);
  }, [isDragging, dragStart, lastMousePosition, lastMoveTime, scheduleUpdate]);

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
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp, { passive: true });

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        // クリーンアップ時にアニメーションフレームもキャンセル
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        isAnimating.current = false;
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
      >
        <div className="flex items-center gap-6 mb-6">
          <Image
            src="/assets/images/Lunacea-nobg.png"
            alt="Lunacea"
            width={80}
            height={80}
            className="rounded-full pointer-events-none"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Lunacea</h1>
            <p className="text-muted-foreground">Web Developer & Human Interaction Designer</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Icon icon={<SiGithub className="w-4 h-4" />} className="text-muted-foreground w-4" />
            <span className="text-sm text-muted-foreground">Lunacea</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon icon={<SiX className="w-4 h-4" />} className="text-muted-foreground w-4" />
            <span className="text-sm text-muted-foreground">@_Lunacea</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon icon={<SiMinutemailer className="w-4 h-4" />} className="text-muted-foreground w-4" />
            <span className="text-sm text-muted-foreground">contact@lunacea.jp</span>
          </div>
        </div>

        {/* University Info */}
        <div className="flex justify-center items-center gap-6 text-xs text-muted-foreground pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Icon icon={<FaMapMarkerAlt className="w-4 h-4" />} className="text-muted-foreground" />
            <span>岩手県立大学</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon icon={<FaGraduationCap className="w-4 h-4" />} className="text-muted-foreground" />
            <span>ソフトウェア情報学研究科</span>
          </div>
        </div>

        {/* ドラッグヒント */}
        <div className="absolute top-2 right-2 opacity-40 pointer-events-none">
          <div className="text-xs text-muted-foreground">📌</div>
        </div>

        {/* Drag Meテキスト */}
        <div className="absolute bottom-2 left-2 opacity-30 pointer-events-none">
          <div className="text-xs text-muted-foreground italic">drag me</div>
        </div>
      </div>
    </div>
  );
}
