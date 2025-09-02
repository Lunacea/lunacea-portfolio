'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMermaid, type MermaidTheme } from '@/features/blog/hooks/useMermaid';
import { useThemeObserver } from '@/features/blog/hooks/useThemeObserver';
import MermaidErrorDisplay from './MermaidErrorDisplay';
import MermaidLoadingDisplay from './MermaidLoadingDisplay';

type MermaidDiagramProps = {
  children: string;
  className?: string;
};

/**
 * Mermaid図表をレンダリングするコンポーネント
 * リファクタリング版：責務分離とカスタムフック活用
 */
export default function MermaidDiagram({ children, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerId] = useState(() => `mermaid-container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  const { 
    isLoading, 
    error, 
    isInitialized, 
    initializeMermaid, 
    renderDiagram, 
    updateTheme 
  } = useMermaid();

  // テーマ変更の監視
  useThemeObserver(async (theme: MermaidTheme) => {
    await updateTheme(theme);
    // テーマ変更後は再レンダリング
    if (containerRef.current && children) {
      await handleRender();
    }
  });

  const handleRender = useCallback(async () => {
    if (!containerRef.current || !children) return;

    const result = await renderDiagram(children, containerId);
    
    if (result.error) {
      // エラーはuseMermaidフックで管理されるため、ここでは何もしない
      return;
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = result.svg;
    }
  }, [children, containerId, renderDiagram]);

  useEffect(() => {
    const initializeAndRender = async () => {
      if (!isInitialized) {
        // 現在のテーマを検出して初期化
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        await initializeMermaid(currentTheme);
      }
      
      if (isInitialized && children) {
        await handleRender();
      }
    };

    initializeAndRender();
  }, [children, isInitialized, initializeMermaid, handleRender]);

  // エラー表示
  if (error) {
    return (
      <div className={`my-6 ${className}`}>
        <MermaidErrorDisplay error={error} />
      </div>
    );
  }

  // ローディング表示
  if (isLoading) {
    return (
      <div className={`my-6 ${className}`}>
        <MermaidLoadingDisplay />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`mermaid-diagram my-6 flex justify-center overflow-auto rounded-2xl border border-border bg-card p-6 shadow-lg ${className}`}
      data-container-id={containerId}
    />
  );
}
