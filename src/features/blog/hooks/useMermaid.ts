'use client';

import { useRef, useCallback, useState } from 'react';
import mermaid from 'mermaid';

export type MermaidTheme = 'light' | 'dark';

export type MermaidConfig = {
  theme: MermaidTheme;
  securityLevel: 'strict' | 'loose' | 'antiscript' | 'sandbox';
  fontFamily: string;
  deterministicIds: boolean;
  deterministicIDSeed?: string;
};

export type MermaidError = {
  message: string;
  originalContent: string;
  correctedContent: string;
};

export type MermaidState = {
  isLoading: boolean;
  error: MermaidError | null;
  isInitialized: boolean;
};

const DEFAULT_CONFIG: MermaidConfig = {
  theme: 'light',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  deterministicIds: false,
};

/**
 * Mermaidライブラリの初期化とテーマ管理を行うカスタムフック
 */
export function useMermaid(config: Partial<MermaidConfig> = {}) {
  const [state, setState] = useState<MermaidState>({
    isLoading: false,
    error: null,
    isInitialized: false,
  });

  const configRef = useRef<MermaidConfig>({ ...DEFAULT_CONFIG, ...config });
  const isInitializedRef = useRef(false);

  const initializeMermaid = useCallback(async (theme: MermaidTheme) => {
    if (isInitializedRef.current) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const currentConfig = { ...configRef.current, theme };
      
      // テーマ変数の設定
      const themeVariables = getThemeVariables(theme);
      
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'base',
        securityLevel: currentConfig.securityLevel,
        fontFamily: currentConfig.fontFamily,
        deterministicIds: currentConfig.deterministicIds,
        deterministicIDSeed: currentConfig.deterministicIDSeed,
        themeVariables,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        sequence: {
          useMaxWidth: true,
        },
        gantt: {
          useMaxWidth: true,
        },
      });

      isInitializedRef.current = true;
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isInitialized: true,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          originalContent: '',
          correctedContent: '',
        }
      }));
    }
  }, []);

  const renderDiagram = useCallback(async (
    content: string, 
    containerId: string
  ): Promise<{ svg: string; error?: MermaidError }> => {
    if (!isInitializedRef.current) {
      await initializeMermaid(configRef.current.theme);
    }

    try {
      const correctedContent = correctMermaidSyntax(content);
      const diagramId = `mermaid-${containerId}-${Date.now()}`;
      const { svg } = await mermaid.render(diagramId, correctedContent);
      
      return { svg };
    } catch (error) {
      const correctedContent = correctMermaidSyntax(content);
      const mermaidError: MermaidError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        originalContent: content,
        correctedContent,
      };
      
      return { svg: '', error: mermaidError };
    }
  }, [initializeMermaid]);

  const updateTheme = useCallback(async (theme: MermaidTheme) => {
    configRef.current.theme = theme;
    
    // Mermaidの内部状態をリセット（利用可能な場合のみ）
    if (typeof (mermaid as unknown as { reset?: () => void }).reset === 'function') {
      (mermaid as unknown as { reset: () => void }).reset();
    }
    
    // 初期化フラグをリセットして再初期化
    isInitializedRef.current = false;
    
    try {
      const currentConfig = { ...configRef.current, theme };
      const themeVariables = getThemeVariables(theme);
      
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === 'dark' ? 'dark' : 'base',
        securityLevel: currentConfig.securityLevel,
        fontFamily: currentConfig.fontFamily,
        deterministicIds: currentConfig.deterministicIds,
        deterministicIDSeed: currentConfig.deterministicIDSeed,
        themeVariables,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        sequence: {
          useMaxWidth: true,
        },
        gantt: {
          useMaxWidth: true,
        },
      });

      isInitializedRef.current = true;
      setState(prev => ({ 
        ...prev, 
        isInitialized: true,
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: {
          message: error instanceof Error ? error.message : 'Theme update error',
          originalContent: '',
          correctedContent: '',
        }
      }));
    }
  }, []);

  return {
    ...state,
    initializeMermaid,
    renderDiagram,
    updateTheme,
  };
}

/**
 * Mermaid構文を修正する
 */
function correctMermaidSyntax(content: string): string {
  let corrected = content.trim();
  
  // 小文字の図表タイプを大文字に修正
  corrected = corrected.replace(/^graph\s+td/i, 'graph TD');
  corrected = corrected.replace(/^sequencediagram/i, 'sequenceDiagram');
  corrected = corrected.replace(/^classdiagram/i, 'classDiagram');
  corrected = corrected.replace(/^gantt/i, 'gantt');
  
  return corrected;
}

/**
 * テーマに応じたカラー変数を取得
 */
function getThemeVariables(theme: MermaidTheme) {
  if (theme === 'dark') {
    return {
      // ダークモード用カラー（OKLCHから変換した16進数カラー）
      primaryColor: '#e5e7eb', // --primary (白に近いグレー)
      primaryTextColor: '#f9fafb', // --foreground (ほぼ白)
      primaryBorderColor: 'rgba(255, 255, 255, 0.1)', // --border (半透明白)
      lineColor: '#9ca3af', // --muted-foreground (ミュートグレー)
      secondaryColor: '#374151', // --secondary (ダークグレー)
      tertiaryColor: '#1f2937', // --card (カード背景)
      background: '#0f172a', // --background (メイン背景)
      mainBkg: '#1f2937', // --card (カード背景)
      secondBkg: '#374151', // --secondary (セカンダリ背景)
      tertiaryBkg: '#374151', // --muted (ミュート背景)
      // フローチャート用
      nodeBkg: '#1f2937', // --card
      nodeBorder: '#e5e7eb', // --primary
      clusterBkg: '#374151', // --secondary
      clusterBorder: 'rgba(255, 255, 255, 0.1)', // --border
      defaultLinkColor: '#e5e7eb', // --primary
      titleColor: '#f9fafb', // --foreground
      // シーケンス図用
      actorBkg: '#1f2937', // --card
      actorBorder: '#e5e7eb', // --primary
      actorTextColor: '#f9fafb', // --foreground
      actorLineColor: 'rgba(255, 255, 255, 0.1)', // --border
      signalColor: '#e5e7eb', // --primary
      signalTextColor: '#f9fafb', // --foreground
      labelBoxBkgColor: '#1f2937', // --card
      labelBoxBorderColor: '#e5e7eb', // --primary
      labelTextColor: '#f9fafb', // --foreground
      loopTextColor: '#f9fafb', // --foreground
      activationBkgColor: '#e5e7eb', // --primary
      activationBorderColor: '#f9fafb', // --foreground
      // ガントチャート用
      sectionBkgColor: '#374151', // --secondary
      altSectionBkgColor: '#374151', // --muted
      gridColor: 'rgba(255, 255, 255, 0.1)', // --border
      todayLineColor: '#ef4444', // --destructive
      // クラス図用
      classText: '#f9fafb', // --foreground
      classBkg: '#1f2937', // --card
      classBorder: '#e5e7eb', // --primary
    };
  }

  return {
    // ライトモード用カラー（OKLCHから変換した16進数カラー）
    primaryColor: '#7c3aed', // --primary (紫)
    primaryTextColor: '#1e1b4b', // --foreground (ダーク紫)
    primaryBorderColor: '#d1d5db', // --border (ライトグレー)
    lineColor: '#6b7280', // --muted-foreground (ミュートグレー)
    secondaryColor: '#f3f4f6', // --secondary (ライトグレー)
    tertiaryColor: '#f9fafb', // --muted (ミュート背景)
    background: '#fefefe', // --background (ほぼ白)
    mainBkg: '#f8fafc', // --card (カード背景)
    secondBkg: '#f3f4f6', // --secondary (セカンダリ背景)
    tertiaryBkg: '#f9fafb', // --muted (ミュート背景)
    // フローチャート用
    nodeBkg: '#f8fafc', // --card
    nodeBorder: '#7c3aed', // --primary
    clusterBkg: '#f3f4f6', // --secondary
    clusterBorder: '#d1d5db', // --border
    defaultLinkColor: '#7c3aed', // --primary
    titleColor: '#1e1b4b', // --foreground
    // シーケンス図用
    actorBkg: '#f8fafc', // --card
    actorBorder: '#7c3aed', // --primary
    actorTextColor: '#1e1b4b', // --foreground
    actorLineColor: '#d1d5db', // --border
    signalColor: '#7c3aed', // --primary
    signalTextColor: '#1e1b4b', // --foreground
    labelBoxBkgColor: '#f8fafc', // --card
    labelBoxBorderColor: '#7c3aed', // --primary
    labelTextColor: '#1e1b4b', // --foreground
    loopTextColor: '#1e1b4b', // --foreground
    activationBkgColor: '#7c3aed', // --primary
    activationBorderColor: '#1e1b4b', // --foreground
    // ガントチャート用
    sectionBkgColor: '#f3f4f6', // --secondary
    altSectionBkgColor: '#f9fafb', // --muted
    gridColor: '#d1d5db', // --border
    todayLineColor: '#dc2626', // --destructive
    // クラス図用
    classText: '#1e1b4b', // --foreground
    classBkg: '#f8fafc', // --card
    classBorder: '#7c3aed', // --primary
  };
}
