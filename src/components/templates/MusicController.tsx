'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import Icon from '@/components/Icon';
import { useBGMStore } from '@/stores/bgm';

const VISUALIZER_KEYS = ['mid', 'high1', 'high2'] as const;

export const MusicController = () => {
  const [animationValues, setAnimationValues] = useState([0.3, 0.6, 0.4]);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const previousValuesRef = useRef([0.3, 0.6, 0.4]);

  // BGMストアから必要な状態とアクションを取得
  const isPlaying = useBGMStore(state => state.isPlaying);
  const volume = useBGMStore(state => state.volume);
  const setVolume = useBGMStore(state => state.setVolume);
  const play = useBGMStore(state => state.play);
  const pause = useBGMStore(state => state.pause);

  // 音楽オンオフ切り替え
  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  // 値の比較関数
  const valuesChanged = useCallback((newValues: number[], oldValues: number[]) => {
    return newValues.some((value, index) => Math.abs(value - (oldValues[index] ?? 0)) > 0.01);
  }, []);

  // ビジュアライザーのアニメーション
  useEffect(() => {
    const animate = (timestamp: number) => {
      // フレームレート制御（約60FPSに制限）
      if (timestamp - lastUpdateRef.current < 16.67) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastUpdateRef.current = timestamp;

      // ストアから最新の値を取得
      const currentIsPlaying = useBGMStore.getState().isPlaying;
      const currentFrequencyData = useBGMStore.getState().frequencyData;

      // 音声データ更新
      const updateFrequencyData = useBGMStore.getState().updateFrequencyData;
      if (updateFrequencyData) {
        updateFrequencyData();
      }

      let newValues: number[] = [];

      if (currentIsPlaying && currentFrequencyData && currentFrequencyData.length > 0) {
        // 中音域と高音域に特化した音楽データ連動
        const mid = Math.min((currentFrequencyData[20] || 0) / 255, 1.0); // 中音域
        const high1 = Math.min((currentFrequencyData[40] || 0) / 255, 1.0); // 高音域1
        const high2 = Math.min((currentFrequencyData[60] || 0) / 255, 1.0); // 高音域2

        newValues = [
          Math.max(0.3, mid * 1.2), // 中音域の係数を下げる
          Math.max(0.4, high1 * 1.5), // 高音域1の係数を下げる
          Math.max(0.3, high2 * 1.3), // 高音域2の係数を下げる
        ];
      } else if (currentIsPlaying && (!currentFrequencyData || currentFrequencyData.length === 0)) {
        // 音楽再生中だが音声データがない場合：活発なランダムアニメーション
        const time = timestamp * 0.005;
        newValues = [
          0.3 + Math.sin(time) * 0.3 + Math.random() * 0.2,
          0.4 + Math.sin(time * 1.5) * 0.4 + Math.random() * 0.3,
          0.3 + Math.sin(time * 0.7) * 0.3 + Math.random() * 0.2,
        ];
      } else if (!currentIsPlaying) {
        // 停止時：緩やかに静的な状態に戻る
        const targetValues = [0.3, 0.4, 0.3];
        const easeSpeed = 0.05; // 緩やかさを調整（0.05-0.1程度）

        newValues = previousValuesRef.current.map((current, index) => {
          const target = targetValues[index] ?? 0.3; // デフォルト値を提供
          const diff = target - current;
          return current + diff * easeSpeed;
        });
      }

      // 値が実際に変化した場合のみ状態を更新
      if (newValues.length > 0 && valuesChanged(newValues, previousValuesRef.current)) {
        previousValuesRef.current = newValues;
        setAnimationValues(newValues);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [valuesChanged]); // valuesChangedを依存配列に追加

  const volumePercentage = volume * 100;

  return (
    <>
      {/* 音量スライダー - デスクトップのみ */}
      <div className="hidden md:flex items-center gap-2 p-3 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 rounded-lg">
        <Icon icon={<FaVolumeUp />} className="text-slate-600 dark:text-white/70 text-xs flex-shrink-0" />
        <div className="relative w-20 h-6 flex items-center">
          {/* スライダーの背景線 */}
          <div className="absolute w-full h-0.5 bg-slate-300 dark:bg-white/20 rounded-full"></div>
          {/* スライダーの進行バー */}
          <div
            className="absolute h-0.5 bg-slate-600 dark:bg-white/70 rounded-full transition-all duration-200 w-[var(--volume-width)]"
            style={{ '--volume-width': `${volumePercentage}%` } as React.CSSProperties}
          >
          </div>
          {/* 現在位置の縦線（ハンドル） */}
          <div
            className="absolute w-0.5 h-3 bg-slate-600 dark:bg-white/70 rounded-full transition-all duration-200 left-[var(--volume-position)]"
            style={{ '--volume-position': `calc(${volumePercentage}% - 1px)` } as React.CSSProperties}
          >
          </div>
          {/* 非表示のinput */}
          <input
            type="range"
            min="0"
            max="100"
            value={volumePercentage}
            onChange={e => setVolume(Number(e.target.value) / 100)}
            aria-label="音量調整"
            className="absolute w-full h-6 opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* ビジュアライザー（音声オンオフボタン） */}
      <button
        type="button"
        onClick={toggleMusic}
        className="p-3 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 rounded-lg group"
        aria-label={isPlaying ? '音楽を停止' : '音楽を再生'}
      >
        <div className="w-6 h-6 flex justify-center items-end gap-1.5">
          {animationValues.map((value, index) => {
            const barHeight = Math.min(Math.max(value * 100, 30), 100);
            const barOpacity = isPlaying ? 0.7 + (value * 0.3) : 0.7;

            return (
              <span
                key={VISUALIZER_KEYS[index]}
                className="
                  block w-0.5 bg-slate-600 dark:bg-white/70 group-hover:bg-slate-800 dark:group-hover:bg-white rounded-full
                  transform transition-all duration-100 ease-out h-[var(--bar-height)] opacity-[var(--bar-opacity)]"
                style={{
                  '--bar-height': `${barHeight}%`,
                  '--bar-opacity': barOpacity,
                } as React.CSSProperties}
                title={`Bar ${index}: ${Math.round(barHeight)}%, opacity: ${barOpacity.toFixed(2)}`}
              />
            );
          })}
        </div>
      </button>
    </>
  );
};
