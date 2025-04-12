'use client';

import type {
  ColorRatiosType,
} from './context/ColorRatiosContext';
import React, { useMemo, useState } from 'react';
import {
  ColorRatiosContext,
  DEFAULT_COLOR_RATIOS,
} from './context/ColorRatiosContext';

// プロバイダーコンポーネント
export const ColorRatiosProvider: React.FC<{
  children: React.ReactNode;
  initialRatios?: ColorRatiosType;
}> = ({ children, initialRatios = DEFAULT_COLOR_RATIOS }) => {
  const [colorRatios, setColorRatios] = useState(initialRatios);

  // コンテキスト値をメモ化
  const contextValue = useMemo(() => ({
    colorRatios,
    setColorRatios,
  }), [colorRatios]);

  return (
    <ColorRatiosContext value={contextValue}>
      {children}
    </ColorRatiosContext>
  );
};
