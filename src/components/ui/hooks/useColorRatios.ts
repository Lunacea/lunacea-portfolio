'use client';

import type { ColorRatiosContextType } from '../context/ColorRatiosContext';
import { use } from 'react';
import { ColorRatiosContext } from '../context/ColorRatiosContext';

// フックの定義
export const useColorRatios = (): ColorRatiosContextType => {
  const context = use(ColorRatiosContext);
  if (!context) {
    throw new Error('useColorRatios must be used within a ColorRatiosProvider');
  }
  return context;
};
