'use client';

import dynamic from 'next/dynamic';

// BGMPlayerをクライアントサイドのみでロード（SSR無効）
const BGMPlayer = dynamic(() => import('./BGMPlayer').then(mod => mod.BGMPlayer), {
  ssr: false,
  loading: () => null, // ロード中は何も表示しない
});

export const BGMPlayerWrapper = () => {
  return <BGMPlayer />;
};
