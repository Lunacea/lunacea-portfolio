'use client';

import { createContext } from 'react';

// 色の比率を管理するためのContext
export type ColorRatiosType = {
  blue: number;
  green: number;
  yellow: number;
};

export type ColorRatiosContextType = {
  colorRatios: ColorRatiosType;
  setColorRatios: React.Dispatch<React.SetStateAction<ColorRatiosType>>;
};

// デフォルト値をコンポーネント外部で定義
export const DEFAULT_COLOR_RATIOS: ColorRatiosType = {
  blue: 0.6,
  green: 0.2,
  yellow: 0.2,
};

// コンテキストの作成
export const ColorRatiosContext = createContext<ColorRatiosContextType | null>(null);
