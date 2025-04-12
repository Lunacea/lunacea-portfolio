'use client';

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * CRTエフェクトの動的ローダーコンポーネント
 * WebGLの依存関係をSSRから除外し、クライアントサイドでのみレンダリングします
 */
const CRTEffect = dynamic(() => import('./CRTEffect'), {
  ssr: false,
});

type DynamicCRTEffectProps = {
  className?: string;
};

export default function DynamicCRTEffect({ className }: DynamicCRTEffectProps) {
  return <CRTEffect className={className} />;
}
