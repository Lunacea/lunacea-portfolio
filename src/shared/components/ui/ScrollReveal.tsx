'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './ScrollReveal.module.css';

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  threshold?: number;
};

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    let timerId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          timerId = setTimeout(() => {
            setIsVisible(true);
          }, delay);
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -10% 0px',
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [delay, threshold]);

  const hiddenClass = direction === 'up'
    ? styles.hiddenUp
    : direction === 'down'
      ? styles.hiddenDown
      : direction === 'left'
        ? styles.hiddenLeft
        : direction === 'right'
          ? styles.hiddenRight
          : styles.hiddenFade;

  return (
    <div ref={elementRef} className={`${styles.base} ${isVisible ? styles.visible : hiddenClass} ${className}`}>
      {children}
    </div>
  );
}
