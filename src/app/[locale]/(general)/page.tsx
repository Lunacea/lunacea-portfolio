'use client';

import ModernAudioVisualizer from '@/components/core/ModernAudioVisualizer';
import { LatestUpdates } from '@/components/templates/LatestUpdates';

export default function Index() {
  return (
    <>
      <div className="w-full flex items-center justify-center overflow-hidden h-full">
        <ModernAudioVisualizer size={600} className="mx-auto" />
      </div>
      <LatestUpdates />
    </>
  );
}
