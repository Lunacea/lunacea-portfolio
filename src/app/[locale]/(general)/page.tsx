'use client';

import ModernAudioVisualizer from '@/components/core/ModernAudioVisualizer';

export default function Index() {
  return (
    <div className="w-full flex items-center justify-center">
      <ModernAudioVisualizer size={600} className="mx-auto" />
    </div>
  );
}
