'use client';

import { faMusic } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Icon } from '@/components/Icon';
import { useBGMStore } from '@/stores/bgm';

type ModernAudioVisualizerProps = {
  className?: string;
  size?: number;
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

export default function ModernAudioVisualizer({
  className = '',
  size = 400,
}: ModernAudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothedDataRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>(0);

  // Zustandストアから状態とアクションを取得（パフォーマンス最適化）
  const isPlaying = useBGMStore(state => state.isPlaying);
  const hasUserConsent = useBGMStore(state => state.hasUserConsent);
  const frequencyData = useBGMStore(state => state.frequencyData);

  // アクション
  const updateFrequencyData = useBGMStore(state => state.updateFrequencyData);

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
      // 音声データ更新
      updateFrequencyData();

      // キャンバスクリア（完全に透明）
      ctx.clearRect(0, 0, size, size);

      // 音楽連動または装飾的パターン
      const musicalBands = isPlaying && frequencyData
        ? selectMusicalFrequencies(frequencyData)
        : getDecorativePattern(timestamp, 52);

      const bandCount = musicalBands.length;

      // スムージング処理
      if (smoothedDataRef.current.length !== bandCount) {
        smoothedDataRef.current = Array.from({ length: bandCount }, () => 0);
      }

      for (let i = 0; i < bandCount; i++) {
        const target = musicalBands[i] ?? 0;
        const current = smoothedDataRef.current[i] ?? 0;
        const smoothing = isPlaying ? 0.15 : 0.05; // 音楽時は速く、装飾時はゆっくり
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
      const hue = isPlaying
        ? (averageIntensity * 360 + timestamp * 0.05) % 360
        : (timestamp * 0.02) % 360; // 装飾時はゆっくりとした色変化
      const saturation = isPlaying ? 70 + averageIntensity * 30 : 50;
      const lightness = isPlaying ? 50 + averageIntensity * 20 : 40;

      ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.lineWidth = isPlaying ? 2 + averageIntensity * 3 : 2;
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
  }, [isPlaying, frequencyData, drawParams, size, updateFrequencyData]);

  return (
    <div className={`relative ${className}`}>
      {/* ユーザー許可確認モーダル */}
      {hasUserConsent === null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl border border-white/20 max-w-md">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Icon icon={faMusic} />
              音楽サイトへようこそ
            </h3>
            <p className="text-gray-300 mb-6">
              このサイトでは音楽が流れます。
              <br />
              音楽を再生しますか？
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => useBGMStore.getState().grantConsent()}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                はい、再生する
              </button>
              <button
                type="button"
                onClick={() => useBGMStore.getState().denyConsent()}
                className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
              >
                いいえ、後で
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ビジュアライザー - 基準線と動く部分のみ */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full"
      />
    </div>
  );
}
