'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useBGMStore } from '@/stores/bgm';

export type AudioCanvasProps = {
  size: number;
  className?: string;
};

// 音楽的周波数帯域の選択（最適化版）
function selectMusicalFrequencies(audioData: Uint8Array | null): number[] {
  if (!audioData || audioData.length === 0) {
    return Array.from({ length: 52 }, () => 0);
  }

  const frequencyRanges = [
    { start: 8, end: 24, samples: 8 }, // 低音域
    { start: 25, end: 60, samples: 16 }, // 中低音域
    { start: 61, end: 120, samples: 16 }, // 中音域
    { start: 121, end: 200, samples: 8 }, // 中高音域
    { start: 201, end: 350, samples: 4 }, // 高音域
  ];

  const selectedBands: number[] = [];

  for (const range of frequencyRanges) {
    const rangeSize = range.end - range.start + 1;
    const step = rangeSize / range.samples;

    for (let i = 0; i < range.samples; i++) {
      const index = Math.floor(range.start + i * step);
      if (index < audioData.length) {
        const normalizedValue = Math.min((audioData[index] ?? 0) / 180, 1.0);
        selectedBands.push(normalizedValue);
      } else {
        selectedBands.push(0);
      }
    }
  }

  return selectedBands;
}

// 時間ベースの装飾的パターン（音楽なし時用）
function getDecorativePattern(time: number, bandCount: number): number[] {
  return Array.from({ length: bandCount }, (_, i) => {
    const angle = (i / bandCount) * Math.PI * 2;
    const wave1 = Math.sin(time * 0.001 + angle) * 0.3;
    const wave2 = Math.sin(time * 0.002 + angle * 2) * 0.2;
    return Math.max(0, (wave1 + wave2 + 0.5) * 0.5);
  });
}

export const AudioCanvas = ({ size, className = '' }: AudioCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothedDataRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>(0);

  // メモ化された描画パラメータ
  const drawParams = useMemo(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.25;
    const maxWaveHeight = size * 0.15;

    return { centerX, centerY, baseRadius, maxWaveHeight };
  }, [size]);

  // キャンバスサイズの設定
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    }
  }, [size]);

  // 描画ループ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const { centerX, centerY, baseRadius, maxWaveHeight } = drawParams;

    const draw = (timestamp: number) => {
      // ストアから最新の値を取得
      const currentIsPlaying = useBGMStore.getState().isPlaying;
      const currentFrequencyData = useBGMStore.getState().frequencyData;

      // 音声データ更新
      useBGMStore.getState().updateFrequencyData();

      // キャンバスクリア（完全に透明）
      ctx.clearRect(0, 0, size, size);

      // 音楽連動または装飾的パターン
      const musicalBands = currentIsPlaying && currentFrequencyData
        ? selectMusicalFrequencies(currentFrequencyData)
        : getDecorativePattern(timestamp, 52);

      const bandCount = musicalBands.length;

      // スムージング処理
      if (smoothedDataRef.current.length !== bandCount) {
        smoothedDataRef.current = Array.from({ length: bandCount }, () => 0);
      }

      for (let i = 0; i < bandCount; i++) {
        const target = musicalBands[i] ?? 0;
        const current = smoothedDataRef.current[i] ?? 0;
        const smoothing = currentIsPlaying ? 0.15 : 0.05; // 音楽時は速く、装飾時はゆっくり
        smoothedDataRef.current[i] = current + (target - current) * smoothing;
      }

      // 点対称配置
      const symmetricData = [
        ...smoothedDataRef.current,
        ...smoothedDataRef.current,
      ];

      const totalPoints = symmetricData.length;
      const averageIntensity = symmetricData.reduce((sum, val) => sum + val, 0) / totalPoints;

      // 動的カラー
      const hue = currentIsPlaying
        ? (averageIntensity * 360 + timestamp * 0.05) % 360
        : (timestamp * 0.02) % 360; // 装飾時はゆっくりとした色変化
      const saturation = currentIsPlaying ? 70 + averageIntensity * 30 : 50;
      const lightness = currentIsPlaying ? 50 + averageIntensity * 20 : 40;

      ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.lineWidth = currentIsPlaying ? 2 + averageIntensity * 3 : 2;
      ctx.beginPath();

      const angleStep = (Math.PI * 2) / totalPoints;

      for (let i = 0; i < totalPoints; i++) {
        const angle = i * angleStep;
        const intensity = symmetricData[i] ?? 0;
        const waveHeight = intensity * maxWaveHeight;
        const radius = baseRadius + waveHeight;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.stroke();

      // 基準線
      ctx.strokeStyle = 'rgba(80, 80, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawParams, size]); // isPlayingとfrequencyDataを依存配列から除外

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`w-full h-full ${className}`}
    />
  );
};
