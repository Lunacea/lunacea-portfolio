'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useBGMStore } from '@/features/bgm/store';

export type AudioCanvasProps = {
  size: number;
  className?: string;
};

function selectMusicalFrequencies(audioData: Uint8Array | null): number[] {
  if (!audioData || audioData.length === 0) {
    return Array.from({ length: 52 }, () => 0);
  }

  const frequencyRanges = [
    { start: 8, end: 24, samples: 8 },
    { start: 25, end: 60, samples: 16 },
    { start: 61, end: 120, samples: 16 },
    { start: 121, end: 200, samples: 8 },
    { start: 201, end: 350, samples: 4 },
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

// より多様でランダム感のある装飾パターン
const DECORATIVE_PATTERNS = [
  // パターン1: 円形の棒グラフ
  (time: number, bandCount: number): number[] => {
    return Array.from({ length: bandCount }, (_, i) => {
      const base = 0.2;
      const pulse = Math.sin(time * 0.002 + i * 0.4) * 0.3;
      const random = Math.sin(time * 0.001 + i * 123.456) * 0.2;
      return Math.max(0, base + pulse + random);
    });
  },
  // パターン2: スパイラル波
  (time: number, bandCount: number): number[] => {
    return Array.from({ length: bandCount }, (_, i) => {
      const angle = (i / bandCount) * Math.PI * 2;
      const spiral = Math.sin(time * 0.0005 + angle * 3) * 0.25;
      const pulse = Math.sin(time * 0.003 + i * 0.5) * 0.15;
      return Math.max(0, (spiral + pulse + 0.4) * 0.5);
    });
  },
  // パターン3: 規則的矩形配置（明るさ・透明度・太さ変化）
  (time: number, bandCount: number): number[] => {
    return Array.from({ length: bandCount }, (_, i) => {
      const base = 0.3;
      const brightness = Math.sin(time * 0.001 + i * 0.6) * 0.25;
      const pattern = Math.sin(time * 0.002 + (i % 3) * Math.PI) * 0.2;
      const random = Math.sin(time * 0.0007 + i * 234.567) * 0.15;
      return Math.max(0, base + brightness + pattern + random);
    });
  },
  // パターン4: 同心円
  (time: number, bandCount: number): number[] => {
    return Array.from({ length: bandCount }, (_, i) => {
      const radius = i / bandCount;
      const wave = Math.sin(time * 0.001 + radius * Math.PI * 4) * 0.25;
      const pulse = Math.sin(time * 0.003 + i * 0.3) * 0.2;
      return Math.max(0, (0.3 - radius * 0.2) + wave + pulse);
    });
  },
  // パターン5: チェッカーボード風
  (time: number, bandCount: number): number[] => {
    return Array.from({ length: bandCount }, (_, i) => {
      const checker = (i % 4 < 2) ? 0.4 : 0.1;
      const wave = Math.sin(time * 0.002 + i * 0.5) * 0.2;
      const random = Math.sin(time * 0.001 + i * 789.123) * 0.15;
      return Math.max(0, checker + wave + random);
    });
  },
  // パターン6: ランダムウォーク
  (time: number, bandCount: number): number[] => {
    return Array.from({ length: bandCount }, (_, i) => {
      const noise = Math.sin(time * 0.001 + i * 123.456) * 0.2;
      const trend = Math.sin(time * 0.0003 + i * 0.1) * 0.15;
      const pulse = Math.sin(time * 0.004 + i * 0.7) * 0.1;
      return Math.max(0, 0.25 + noise + trend + pulse);
    });
  },
  // パターン7: 波紋
  (time: number, bandCount: number): number[] => {
    return Array.from({ length: bandCount }, (_, i) => {
      const angle = (i / bandCount) * Math.PI * 2;
      const wave1 = Math.sin(time * 0.001 + angle) * 0.3;
      const wave2 = Math.sin(time * 0.002 + angle * 2) * 0.2;
      const random = Math.sin(time * 0.0005 + i * 456.789) * 0.1;
      return Math.max(0, (wave1 + wave2 + random + 0.5) * 0.4);
    });
  },
  // パターン8: パルス
  (time: number, bandCount: number): number[] => {
    return Array.from({ length: bandCount }, (_, i) => {
      const base = 0.3;
      const pulse = Math.sin(time * 0.002 + i * 0.3) * 0.2;
      const wave = Math.sin(time * 0.001 + (i / bandCount) * Math.PI * 2) * 0.15;
      const random = Math.sin(time * 0.003 + i * 567.890) * 0.1;
      return Math.max(0, base + pulse + wave + random);
    });
  }
];

function getDecorativePattern(time: number, bandCount: number): number[] {
  return Array.from({ length: bandCount }, (_, i) => {
    const angle = (i / bandCount) * Math.PI * 2;
    const wave1 = Math.sin(time * 0.001 + angle) * 0.3;
    const wave2 = Math.sin(time * 0.002 + angle * 2) * 0.2;
    return Math.max(0, (wave1 + wave2 + 0.5) * 0.5);
  });
}

// 描画パターンを選択する関数
function selectDrawingPattern(patternIndex: number): 'bars' | 'wave' | 'rectangles' | 'spiral' | 'grid' {
  const patterns = ['bars', 'wave', 'rectangles', 'spiral', 'grid'];
  return patterns[patternIndex % patterns.length] as 'bars' | 'wave' | 'rectangles' | 'spiral' | 'grid';
}

// 美しい色味のパレット（美しい色味のみを厳選）
const BEAUTIFUL_COLOR_PALETTES = [
  // パレット1: オーシャンブルー系
  [
    { hue: 200, saturation: 70, lightness: 45 }, // 深い青
    { hue: 210, saturation: 65, lightness: 50 }, // 海の青
    { hue: 220, saturation: 60, lightness: 55 }, // 空の青
    { hue: 190, saturation: 75, lightness: 40 }, // ティール
    { hue: 180, saturation: 70, lightness: 45 }, // シアン
  ],
  // パレット2: フォレストグリーン系
  [
    { hue: 120, saturation: 65, lightness: 45 }, // 深い緑
    { hue: 140, saturation: 60, lightness: 50 }, // エメラルド
    { hue: 160, saturation: 70, lightness: 40 }, // ティールグリーン
    { hue: 100, saturation: 75, lightness: 35 }, // ダークグリーン
    { hue: 130, saturation: 65, lightness: 55 }, // ライトグリーン
  ],
  // パレット3: サンセット系
  [
    { hue: 15, saturation: 80, lightness: 50 },  // オレンジ
    { hue: 25, saturation: 75, lightness: 55 },  // コーラル
    { hue: 35, saturation: 70, lightness: 60 },  // ピーチ
    { hue: 5, saturation: 85, lightness: 45 },   // レッドオレンジ
    { hue: 45, saturation: 65, lightness: 65 },  // ライトオレンジ
  ],
  // パレット4: ラベンダー系
  [
    { hue: 270, saturation: 60, lightness: 50 }, // ラベンダー
    { hue: 280, saturation: 65, lightness: 45 }, // パープル
    { hue: 290, saturation: 55, lightness: 55 }, // ライトパープル
    { hue: 260, saturation: 70, lightness: 40 }, // インディゴ
    { hue: 300, saturation: 60, lightness: 50 }, // マゼンタ
  ],
  // パレット5: アーストーン系
  [
    { hue: 30, saturation: 70, lightness: 45 },  // ブラウン
    { hue: 40, saturation: 65, lightness: 50 },  // タン
    { hue: 50, saturation: 60, lightness: 55 },  // ベージュ
    { hue: 20, saturation: 75, lightness: 40 },  // ダークブラウン
    { hue: 60, saturation: 55, lightness: 60 },  // サンド
  ],
  // パレット6: モノクローム系
  [
    { hue: 0, saturation: 0, lightness: 30 },    // ダークグレー
    { hue: 0, saturation: 0, lightness: 45 },    // ミディアムグレー
    { hue: 0, saturation: 0, lightness: 60 },    // ライトグレー
    { hue: 0, saturation: 0, lightness: 75 },    // ベリーライトグレー
    { hue: 0, saturation: 0, lightness: 90 },    // オフホワイト
  ]
];

// 美しい色味のパレットからランダムに選択
function selectBeautifulColorPalette(): { hue: number; saturation: number; lightness: number }[] {
  const randomPaletteIndex = Math.floor(Math.random() * BEAUTIFUL_COLOR_PALETTES.length);
  // 配列の範囲内であることを確認（実際には常にtrueになるが、型安全性のため）
  if (randomPaletteIndex >= 0 && randomPaletteIndex < BEAUTIFUL_COLOR_PALETTES.length) {
    return BEAUTIFUL_COLOR_PALETTES[randomPaletteIndex] as { hue: number; saturation: number; lightness: number }[];
  }
  // フォールバック: デフォルトのオーシャンブルー系パレット
  return BEAUTIFUL_COLOR_PALETTES[0] as { hue: number; saturation: number; lightness: number }[];
}

// パレット内からランダムにベースカラーを選択
function selectRandomBaseColor(palette: { hue: number; saturation: number; lightness: number }[]): { hue: number; saturation: number; lightness: number } {
  const randomIndex = Math.floor(Math.random() * palette.length);
  // 配列の範囲内であることを確認（実際には常にtrueになるが、型安全性のため）
  if (randomIndex >= 0 && randomIndex < palette.length) {
    return palette[randomIndex] as { hue: number; saturation: number; lightness: number };
  }
  // フォールバック: デフォルトの青系カラー
  return { hue: 200, saturation: 70, lightness: 45 };
}

// 碁盤型配置描画（色・太さ・透明度変化）
function drawGrid(
  ctx: CanvasRenderingContext2D,
  data: number[],
  centerX: number,
  centerY: number,
  baseRadius: number,
  baseColor: { hue: number; saturation: number; lightness: number }
): void {
  const gridSize = 8; // 8x8のグリッド
  const cellSize = (baseRadius * 2) / gridSize;
  const startX = centerX - baseRadius;
  const startY = centerY - baseRadius;
  
  // ベースカラーを使用
  const baseHue = baseColor.hue;
  const baseSaturation = baseColor.saturation;
  const baseLightness = baseColor.lightness;
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      const intensity = data[index % data.length] ?? 0;
      
      // 中央部分の重み付け（適度に調整）
      const centerDistance = Math.sqrt(
        Math.pow((row - gridSize/2) / (gridSize/2), 2) + 
        Math.pow((col - gridSize/2) / (gridSize/2), 2)
      );
      const centerWeight = Math.max(0.5, 1.0 - centerDistance * 0.3);
      const adjustedIntensity = intensity * centerWeight;
      
      // 色の変化（ベースカラーを基準とした安定した変化）
      const hueVariation = (baseHue + adjustedIntensity * 40 + (row + col) * 8) % 360;
      const saturation = Math.max(50, baseSaturation - centerDistance * 10 + adjustedIntensity * 20);
      const lightness = Math.max(30, baseLightness - centerDistance * 8 + adjustedIntensity * 25);
      
      // 太さの変化（中央部分を適度に強調）
      const thickness = 1 + adjustedIntensity * 3 + centerWeight * 0.5;
      
      // 透明度の変化（中央部分を明確化）
      const alpha = 0.4 + adjustedIntensity * 0.5 + centerWeight * 0.1;
      
      // セルの位置
      const x = startX + col * cellSize + cellSize / 2;
      const y = startY + row * cellSize + cellSize / 2;
      
      // 描画設定
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `hsl(${hueVariation}, ${saturation}%, ${lightness}%)`;
      ctx.strokeStyle = `hsl(${hueVariation}, ${Math.max(20, saturation - 20)}%, ${Math.max(20, lightness - 20)}%)`;
      ctx.lineWidth = thickness;
      
      // セルの描画（角丸矩形風）
      const rectSize = cellSize * (0.75 + centerWeight * 0.1);
      const rectX = x - rectSize / 2;
      const rectY = y - rectSize / 2;
      
      // 角丸矩形の描画
      ctx.beginPath();
      ctx.roundRect(rectX, rectY, rectSize, rectSize, 4);
      ctx.fill();
      ctx.stroke();
      
      ctx.restore();
    }
  }
}

// 規則的矩形配置描画（明るさ、透明度、太さ変化）
function drawRectangles(
  ctx: CanvasRenderingContext2D,
  data: number[],
  centerX: number,
  centerY: number,
  baseRadius: number,
  maxHeight: number
): void {
  const rectCount = Math.min(data.length, 24); // 矩形の数を制限
  const angleStep = (Math.PI * 2) / rectCount;
  const rectWidth = 8;
  const rectHeight = 20;
  
  for (let i = 0; i < rectCount; i++) {
    const angle = i * angleStep;
    const intensity = data[i] ?? 0;
    
    // 明るさと透明度の変化
    const brightness = 0.3 + intensity * 0.7;
    const alpha = 0.4 + intensity * 0.6;
    
    // 太さの変化
    const thickness = 1 + intensity * 3;
    
    // 矩形の位置計算
    const radius = baseRadius + intensity * maxHeight * 0.5;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // 矩形の回転
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    
    // 明るさと透明度を適用
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(0, 0%, ${brightness * 100}%)`;
    ctx.strokeStyle = `hsl(0, 0%, ${Math.min(100, brightness * 120)}%)`;
    ctx.lineWidth = thickness;
    
    // 矩形を描画
    const rectX = -rectWidth / 2;
    const rectY = -rectHeight / 2;
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
    
    ctx.restore();
  }
}

// 滑らかな曲線描画（パフォーマンス最適化）
function drawSmoothCurve(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  tension = 0.5,
): void {
  if (points.length < 3) {
    return;
  }
  ctx.beginPath();
  const firstPoint = points[0];
  if (!firstPoint) return;
  ctx.moveTo(firstPoint.x, firstPoint.y);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? points.length - 1 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? 0 : i + 2];
    if (!p0 || !p1 || !p2 || !p3) {
      continue;
    }
    const cp1x = p1.x + (p2.x - p0.x) * tension / 6;
    const cp1y = p1.y + (p2.y - p0.y) * tension / 6;
    const cp2x = p2.x - (p3.x - p1.x) * tension / 6;
    const cp2y = p2.y - (p3.y - p1.y) * tension / 6;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }
  const lastPoint = points[points.length - 1];
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

export default function AudioCanvas({ size, className = '' }: AudioCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothedDataRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number>(0);
  const patternIndexRef = useRef<number>(Math.floor(Math.random() * DECORATIVE_PATTERNS.length));
  const drawingPatternRef = useRef<'bars' | 'wave' | 'rectangles' | 'spiral' | 'grid'>(selectDrawingPattern(patternIndexRef.current));
  
  // グリッド用の美しい色味パレットを固定（セッション中）
  const gridColorPaletteRef = useRef<{ hue: number; saturation: number; lightness: number }[]>(selectBeautifulColorPalette());
  const gridBaseColorRef = useRef<{ hue: number; saturation: number; lightness: number }>(selectRandomBaseColor(gridColorPaletteRef.current));
  
  // パターン切り替えの管理（homeアクセスごとに変更）
  // 初期化時に選択されたパターンを維持するため、自動変更は行わない
  
  // 音楽のON/OFF状態に応じた滑らかなアニメーション
  const animationStateRef = useRef<{
    isPlaying: boolean;
    transitionProgress: number;
    targetIntensity: number;
    currentIntensity: number;
  }>({
    isPlaying: false,
    transitionProgress: 0,
    targetIntensity: 0,
    currentIntensity: 0
  });

  const drawParams = useMemo(() => {
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.25;
    const maxWaveHeight = size * 0.15;
    return { centerX, centerY, baseRadius, maxWaveHeight };
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { centerX, centerY, baseRadius, maxWaveHeight } = drawParams;
    
    const draw = (timestamp: number) => {
      const currentIsPlaying = useBGMStore.getState().isPlaying;
      const currentFrequencyData = useBGMStore.getState().frequencyData;
      
      // 音楽のON/OFF状態の変化を検出
      if (animationStateRef.current.isPlaying !== currentIsPlaying) {
        animationStateRef.current.isPlaying = currentIsPlaying;
        animationStateRef.current.transitionProgress = 0;
        animationStateRef.current.targetIntensity = currentIsPlaying ? 1 : 0;
      }
      
      // 滑らかなアニメーション遷移
      const transitionSpeed = 0.05; // アニメーション速度
      if (animationStateRef.current.transitionProgress < 1) {
        animationStateRef.current.transitionProgress += transitionSpeed;
        animationStateRef.current.currentIntensity = 
          animationStateRef.current.currentIntensity + 
          (animationStateRef.current.targetIntensity - animationStateRef.current.currentIntensity) * transitionSpeed;
      }
      
      // パフォーマンス最適化: 更新頻度を制限
      if (timestamp % 2 === 0) {
        useBGMStore.getState().updateFrequencyData();
      }
      
      ctx.clearRect(0, 0, size, size);
      
      const musicalBands = currentIsPlaying && currentFrequencyData
        ? selectMusicalFrequencies(currentFrequencyData)
        : getDecorativePattern(timestamp, 52);
      
      const bandCount = musicalBands.length;
      
      if (smoothedDataRef.current.length !== bandCount) {
        smoothedDataRef.current = Array.from({ length: bandCount }, () => 0);
      }
      
      // スムージング処理（音楽のON/OFFに応じて調整）
      const smoothingFactor = currentIsPlaying ? 0.08 : 0.02;
      const animationIntensity = animationStateRef.current.currentIntensity;
      
      for (let i = 0; i < bandCount; i++) {
        const target = musicalBands[i] ?? 0;
        const current = smoothedDataRef.current[i] ?? 0;
        const smoothing = smoothingFactor * (0.5 + animationIntensity * 0.5);
        smoothedDataRef.current[i] = current + (target - current) * smoothing;
      }
      
      const data = [...smoothedDataRef.current];
      const totalPoints = data.length;
      const averageIntensity = data.reduce((sum, val) => sum + val, 0) / totalPoints;
      
      // カラーパレットの改善（アニメーション状態に応じて）
      const baseHue = currentIsPlaying ? 200 : 0; // 音楽再生時は青系、非再生時は赤系
      const hue = (baseHue + averageIntensity * 60 + timestamp * 0.03) % 360;
      const saturation = currentIsPlaying ? 80 + averageIntensity * 20 : 60;
      const lightness = currentIsPlaying ? 45 + averageIntensity * 25 : 35;
      
      ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.lineWidth = currentIsPlaying ? 1.5 + averageIntensity * 2.5 : 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // パターン切り替えの管理（homeアクセスごとに変更、セッション中は固定）
      // 自動変更は行わず、初期化時に選択されたパターンを維持
      
      // 描画パターンの選択と実行
      const drawingPattern = drawingPatternRef.current;
      
      switch (drawingPattern) {
        case 'bars':
          // 円形の棒グラフ描画
          ctx.beginPath();
          for (let i = 0; i < data.length; i++) {
            const angle = (i / data.length) * Math.PI * 2;
            const intensity = data[i] ?? 0;
            const height = intensity * maxWaveHeight * animationIntensity;
            
            const startX = centerX + Math.cos(angle) * baseRadius;
            const startY = centerY + Math.sin(angle) * baseRadius;
            const endX = centerX + Math.cos(angle) * (baseRadius + height);
            const endY = centerY + Math.sin(angle) * (baseRadius + height);
            
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
          }
          ctx.stroke();
          break;
          
        case 'rectangles':
          drawRectangles(ctx, data, centerX, centerY, baseRadius, maxWaveHeight);
          break;
          
        case 'grid':
          // 美しい色味のパレットからランダムにベースカラーを選択（セッション中は固定）
          drawGrid(ctx, data, centerX, centerY, baseRadius, gridBaseColorRef.current);
          break;
          
        case 'spiral':
          // スパイラル描画
          ctx.beginPath();
          for (let i = 0; i < totalPoints; i++) {
            const angle = (i / totalPoints) * Math.PI * 8; // 4回転
            const intensity = data[i] ?? 0;
            const radius = baseRadius * 0.3 + intensity * maxWaveHeight * animationIntensity;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
          break;
          
        case 'wave':
        default:
          // 波形描画
          const points: { x: number; y: number }[] = [];
          const angleStep = (Math.PI * 2) / totalPoints;
          
          for (let i = 0; i < totalPoints; i++) {
            const angle = i * angleStep;
            const intensity = data[i] ?? 0;
            
            // 非対称な波の高さ（音楽の自然な表現）
            const waveHeight = intensity * maxWaveHeight * (0.8 + Math.sin(angle * 2) * 0.2) * animationIntensity;
            const radius = baseRadius + waveHeight;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            points.push({ x, y });
          }
          
          const tension = currentIsPlaying ? 0.35 + averageIntensity * 0.15 : 0.3;
          drawSmoothCurve(ctx, points, tension);
          ctx.stroke();
          break;
      }
      
      // パフォーマンス最適化: フレームレート制限
      if (currentIsPlaying) {
        animationFrameRef.current = requestAnimationFrame(draw);
      } else {
        // 非再生時は低フレームレート
        setTimeout(() => {
          animationFrameRef.current = requestAnimationFrame(draw);
        }, 50);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(draw);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawParams, size]);

  return (
    <canvas ref={canvasRef} width={size} height={size} className={`w-full h-full ${className}`} />
  );
}
