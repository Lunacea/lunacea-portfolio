'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import { useBGMStore } from '@/features/bgm/store';
import Icon from '@/shared/components/ui/Icon';
import styles from './MusicController.module.css';

const VISUALIZER_KEYS = ['mid', 'high1', 'high2'] as const;

export default function MusicController() {
  const [animationValues, setAnimationValues] = useState([0.3, 0.6, 0.4]);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const previousValuesRef = useRef([0.3, 0.6, 0.4]);

  const isPlaying = useBGMStore(state => state.isPlaying);
  const volume = useBGMStore(state => state.volume);
  const setVolume = useBGMStore(state => state.setVolume);
  const play = useBGMStore(state => state.play);
  const pause = useBGMStore(state => state.pause);

  const progressRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<Array<HTMLSpanElement | null>>([]);

  const toggleMusic = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const valuesChanged = useCallback((nextValues: number[], prevValues: number[]) => {
    return nextValues.some((value, index) => Math.abs(value - (prevValues[index] ?? 0)) > 0.01);
  }, []);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current < 16.67) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastUpdateRef.current = timestamp;

      const store = useBGMStore.getState();
      if (store.updateFrequencyData) {
        store.updateFrequencyData();
      }

      let nextValues: number[] = [];
      if (store.isPlaying && store.frequencyData && store.frequencyData.length > 0) {
        const mid = Math.min((store.frequencyData[20] || 0) / 255, 1.0);
        const high1 = Math.min((store.frequencyData[40] || 0) / 255, 1.0);
        const high2 = Math.min((store.frequencyData[60] || 0) / 255, 1.0);
        nextValues = [
          Math.max(0.3, mid * 1.2),
          Math.max(0.4, high1 * 1.5),
          Math.max(0.3, high2 * 1.3),
        ];
      } else if (store.isPlaying) {
        const time = timestamp * 0.005;
        nextValues = [
          0.3 + Math.sin(time) * 0.3 + Math.random() * 0.2,
          0.4 + Math.sin(time * 1.5) * 0.4 + Math.random() * 0.3,
          0.3 + Math.sin(time * 0.7) * 0.3 + Math.random() * 0.2,
        ];
      } else {
        const targetValues = [0.3, 0.4, 0.3];
        const easeSpeed = 0.05;
        nextValues = previousValuesRef.current.map((current, index) => {
          const target = targetValues[index] ?? 0.3;
          const diff = target - current;
          return current + diff * easeSpeed;
        });
      }

      if (nextValues.length > 0 && valuesChanged(nextValues, previousValuesRef.current)) {
        previousValuesRef.current = nextValues;
        setAnimationValues(nextValues);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [valuesChanged]);

  const volumePercentage = volume * 100;

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${volumePercentage}%`;
    }
    if (handleRef.current) {
      handleRef.current.style.left = `calc(${volumePercentage}% - 1px)`;
    }
  }, [volumePercentage]);

  useEffect(() => {
    barsRef.current.forEach((barElement, index) => {
      if (!barElement) {
        return;
      }
      const value = animationValues[index] ?? 0.3;
      const barHeightPercent = Math.min(Math.max(value * 100, 30), 100);
      const barOpacity = isPlaying ? 0.7 + value * 0.3 : 0.7;
      barElement.style.height = `${barHeightPercent}%`;
      barElement.style.opacity = String(barOpacity);
    });
  }, [animationValues, isPlaying]);

  return (
    <>
      <div className="hidden md:flex items-center gap-2 p-3 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 rounded-lg">
        <Icon icon={<FaVolumeUp />} className="text-slate-600 dark:text-white/70 text-xs flex-shrink-0" />
        <div className="relative w-20 h-6 flex items-center">
          <div className={styles.sliderTrack} />
          <div ref={progressRef} className={styles.sliderProgress} />
          <div ref={handleRef} className={styles.sliderHandle} />
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

      <button
        type="button"
        onClick={toggleMusic}
        className="p-3 hover:bg-black/10 dark:hover:bg-white/5 transition-all duration-200 rounded-lg group"
        aria-label={isPlaying ? '音楽を停止' : '音楽を再生'}
      >
        <div className="w-6 h-6 flex justify-center items-end gap-1.5">
          {VISUALIZER_KEYS.map((key, index) => {
            const barClassName = styles.bar;
            return (
              <span
                key={key}
                ref={(el) => {
                  barsRef.current[index] = el;
                }}
                className={barClassName}
                title={`Bar ${index}`}
              />
            );
          })}
        </div>
      </button>
    </>
  );
};
