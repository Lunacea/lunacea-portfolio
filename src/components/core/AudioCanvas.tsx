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

// スプライン補間でなめらかな曲線を描画する関数
function drawSmoothCurve(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  tension: number = 0.5,
): void {
  if (points.length < 3) {
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0]!.x, points[0]!.y);

  // カーディナルスプライン補間
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? points.length - 1 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? 0 : i + 2];

    // undefined チェックを追加
    if (!p0 || !p1 || !p2 || !p3) {
      continue;
    }

    // 制御点の計算
    const cp1x = p1.x + (p2.x - p0.x) * tension / 6;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 6;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 6;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  // 最後の点から最初の点へのベジェ曲線で閉じる
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const secondPoint = points[1];
  const secondLastPoint = points[points.length - 2];

  if (lastPoint && firstPoint && secondPoint && secondLastPoint) {
    const cp1x = lastPoint.x + (firstPoint.x - secondLastPoint.x) * tension / 6;
    const cp1y = lastPoint.y + (firstPoint.y - secondLastPoint.y) * tension / 6;
    const cp2x = firstPoint.x - (secondPoint.x - lastPoint.x) * tension / 6;
    const cp2y = firstPoint.y - (secondPoint.y - lastPoint.y) * tension / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, firstPoint.x, firstPoint.y);
  }

  ctx.closePath();
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

      // スムージング処理（よりなめらかに）
      if (smoothedDataRef.current.length !== bandCount) {
        smoothedDataRef.current = Array.from({ length: bandCount }, () => 0);
      }

      for (let i = 0; i < bandCount; i++) {
        const target = musicalBands[i] ?? 0;
        const current = smoothedDataRef.current[i] ?? 0;
        // より滑らかなスムージング
        const smoothing = currentIsPlaying ? 0.1 : 0.03;
        smoothedDataRef.current[i] = current + (target - current) * smoothing;
      }

      // 点対称配置（180度回転対称）
      const symmetricData = [
        ...smoothedDataRef.current,
        ...smoothedDataRef.current, // 同じデータを繰り返して点対称に
      ];

      const totalPoints = symmetricData.length;
      const averageIntensity = symmetricData.reduce((sum, val) => sum + val, 0) / totalPoints;

      // 動的カラー
      const hue = currentIsPlaying
        ? (averageIntensity * 360 + timestamp * 0.05) % 360
        : (timestamp * 0.02) % 360;
      const saturation = currentIsPlaying ? 70 + averageIntensity * 30 : 50;
      const lightness = currentIsPlaying ? 50 + averageIntensity * 20 : 40;

      // 座標点を計算
      const points: { x: number; y: number }[] = [];
      const angleStep = (Math.PI * 2) / totalPoints;

      for (let i = 0; i < totalPoints; i++) {
        const angle = i * angleStep;
        const intensity = symmetricData[i] ?? 0;
        const waveHeight = intensity * maxWaveHeight;
        const radius = baseRadius + waveHeight;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        points.push({ x, y });
      }

      // 滑らかな曲線を描画
      ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.lineWidth = currentIsPlaying ? 2 + averageIntensity * 3 : 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // テンション値（0.3-0.6が最適）
      const tension = currentIsPlaying ? 0.4 + averageIntensity * 0.2 : 0.3;
      drawSmoothCurve(ctx, points, tension);
      ctx.stroke();

      // 基準線（より細く、透明度を上げる）
      ctx.strokeStyle = 'rgba(80, 80, 100, 0.2)';
      ctx.lineWidth = 0.5;
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
  }, [drawParams, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`w-full h-full ${className}`}
    />
  );
};
