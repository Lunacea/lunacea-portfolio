'use client';

import React from 'react';
import { AudioCanvas } from '@/components/core/AudioCanvas';
import { UserConsentModal } from '@/components/core/UserConsentModal';

type ModernAudioVisualizerProps = {
  className?: string;
  size?: number;
};

export default function ModernAudioVisualizer({
  className = '',
  size = 400,
}: ModernAudioVisualizerProps) {
  return (
    <div className={`relative ${className}`}>
      {/* ユーザー許可確認モーダル */}
      <UserConsentModal />

      {/* ビジュアライザー - 基準線と動く部分のみ */}
      <AudioCanvas size={size} />
    </div>
  );
}
