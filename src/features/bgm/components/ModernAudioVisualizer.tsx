'use client';

import AudioCanvas from '@/features/bgm/components/AudioCanvas';
import UserConsentModal from '@/features/bgm/components/UserConsentModal';

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
      <UserConsentModal />
      <AudioCanvas size={size} />
    </div>
  );
}
