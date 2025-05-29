'use client';

import ModernAudioVisualizer from '@/components/ModernAudioVisualizer';

export default function Index() {
  return (
    <div className="w-full flex items-center justify-center">
      <ModernAudioVisualizer size={600} className="mx-auto" />
    </div>
  );
}
