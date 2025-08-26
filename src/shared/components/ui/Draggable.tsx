'use client';

import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import styles from './Draggable.module.css';

export type DraggableHandle = {
  reset: () => void;
};

type DraggableProps = {
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

/**
 * Generic draggable wrapper with simple inertia and boundary constraints (window-based by default).
 */
export const Draggable = (
  { ref, children, className = '', ariaLabel }: DraggableProps & { ref?: React.RefObject<DraggableHandle | null> },
) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [slideRotation, setSlideRotation] = useState(0);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingPosition = useRef({ x: 0, y: 0 });
  const isAnimating = useRef(false);

  const constrainPosition = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') {
      return { x, y, bounced: false } as const;
    }

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

    return { x: newX, y: newY, bounced } as const;
  }, []);

  const updatePosition = useCallback(() => {
    if (isAnimating.current) {
      const constrained = constrainPosition(pendingPosition.current.x, pendingPosition.current.y);
      setPosition({ x: constrained.x, y: constrained.y });
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
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
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
      setVelocity({ x: deltaX / deltaTime, y: deltaY / deltaTime });
    }
    setLastMousePosition({ x: clientX, y: clientY });
    setLastMoveTime(currentTime);
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;
    scheduleUpdate(newX, newY);
  }, [isDragging, dragStart, lastMousePosition, lastMoveTime, scheduleUpdate]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleInteractionStart(e.clientX, e.clientY);
  }, [handleInteractionStart]);
  const handleMouseMove = useCallback((e: MouseEvent) => handleInteractionMove(e.clientX, e.clientY), [handleInteractionMove]);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch) {
        handleInteractionStart(touch.clientX, touch.clientY);
      }
    }
  }, [handleInteractionStart]);
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (touch) {
        handleInteractionMove(touch.clientX, touch.clientY);
      }
    }
  }, [handleInteractionMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isAnimating.current = false;
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    let rotation = 0;
    if (speed > 0.1) {
      rotation = Math.max(-30, Math.min(30, velocity.x * 15));
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
        setSlideRotation(rotation + (Math.random() - 0.5) * 20);
      }
      setPosition({ x: constrainedTarget.x, y: constrainedTarget.y });
    }
    setTimeout(() => {
      setSlideRotation(0);
    }, 3000);
  }, [velocity, position, constrainPosition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = 10;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const { x, y } = position;
      const next = constrainPosition(x - step, y);
      setPosition({ x: next.x, y: next.y });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const { x, y } = position;
      const next = constrainPosition(x + step, y);
      setPosition({ x: next.x, y: next.y });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const { x, y } = position;
      const next = constrainPosition(x, y - step);
      setPosition({ x: next.x, y: next.y });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const { x, y } = position;
      const next = constrainPosition(x, y + step);
      setPosition({ x: next.x, y: next.y });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setPosition({ x: 0, y: 0 });
    }
  }, [position, constrainPosition]);

  React.useEffect(() => {
    const mm = (e: MouseEvent) => handleMouseMove(e);
    const tm = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
      handleTouchMove(e);
    };
    const mu = () => handleMouseUp();
    const tu = () => handleMouseUp();
    if (isDragging) {
      document.addEventListener('mousemove', mm, { passive: true });
      document.addEventListener('mouseup', mu, { passive: true });
      document.addEventListener('touchmove', tm, { passive: false });
      document.addEventListener('touchend', tu, { passive: true });
      return () => {
        document.removeEventListener('mousemove', mm);
        document.removeEventListener('mouseup', mu);
        document.removeEventListener('touchmove', tm);
        document.removeEventListener('touchend', tu);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        isAnimating.current = false;
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  useImperativeHandle(ref, () => ({ reset: () => setPosition({ x: 0, y: 0 }) }), []);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) {
      return;
    }
    el.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) rotate(${-2 + slideRotation}deg)`;
    el.style.transition = isDragging ? 'none' : 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    el.style.willChange = isDragging ? 'transform' : 'auto';
  }, [position.x, position.y, slideRotation, isDragging]);

  const wrapperClassName = useMemo(() => `
    ${className}
    ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
    select-none relative
  `, [className, isDragging]);

  const computedAriaLabel = ariaLabel ?? 'Draggable element';

  return (
    <div
      ref={elementRef}
      className={`${styles.draggableBase} ${wrapperClassName}`}
      onMouseDown={handleMouseDown}
      aria-label={computedAriaLabel}
      role="button"
      tabIndex={0}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
};

export default Draggable;
