'use client';

import { useRef, type ReactNode } from 'react';
import ScrollHint from './ScrollHint';

type ScrollHintContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function ScrollHintContainer({ children, className = '' }: ScrollHintContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
      <ScrollHint containerRef={containerRef} />
    </div>
  );
}
