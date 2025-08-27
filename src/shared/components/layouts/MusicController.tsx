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
  const volumeSliderRef = useRef<HTMLInputElement>(null);

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

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value) / 100;
    setVolume(newVolume);
  }, [setVolume]);

  const handleVolumeKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const step = e.shiftKey ? 10 : 1;
    let newVolume: number;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        newVolume = Math.min(1, volume + (step / 100));
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        newVolume = Math.max(0, volume - (step / 100));
        break;
      case 'Home':
        e.preventDefault();
        newVolume = 0;
        break;
      case 'End':
        e.preventDefault();
        newVolume = 1;
        break;
      case 'PageUp':
        e.preventDefault();
        newVolume = Math.min(1, volume + 0.1);
        break;
      case 'PageDown':
        e.preventDefault();
        newVolume = Math.max(0, volume - 0.1);
        break;
      default:
        return;
    }
    
    setVolume(newVolume);
    if (volumeSliderRef.current) {
      volumeSliderRef.current.value = String(Math.round(newVolume * 100));
    }
  }, [volume, setVolume]);

  return (
    <div className="flex items-center gap-2" role="group" aria-label="音楽コントロール">
      {/* 音量コントロール */}
      <div className="hidden md:flex items-center gap-2 p-3 hover:bg-black/10 dark:hover:bg-white/5 focus-within:bg-black/15 dark:focus-within:bg-white/10 transition-all duration-200 rounded-lg focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 focus-within:ring-offset-background">
        <Icon 
          icon={<FaVolumeUp />} 
          className="text-slate-600 dark:text-white/70 text-xs flex-shrink-0" 
          aria-hidden="true"
        />
        <div className="relative w-20 h-6 flex items-center">
          <div className={styles.sliderTrack} />
          <div ref={progressRef} className={styles.sliderProgress} />
          <div ref={handleRef} className={styles.sliderHandle} />
          <input
            ref={volumeSliderRef}
            type="range"
            min="0"
            max="100"
            step="1"
            value={volumePercentage}
            onChange={handleVolumeChange}
            onKeyDown={handleVolumeKeyDown}
            aria-label="音量調整"
            aria-valuetext={`音量 ${volumePercentage}%`}
            className="absolute w-full h-6 opacity-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            title={`音量: ${volumePercentage}%`}
          />
        </div>
        <span className="sr-only">音量: {volumePercentage}%</span>
      </div>

      {/* 再生/停止ボタン */}
      <button
        type="button"
        onClick={toggleMusic}
        className="p-3 hover:bg-black/10 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-within:bg-black/15 dark:focus-within:bg-white/10 transition-all duration-200 rounded-lg group focus-within:ring-2 focus-within:ring-ring/50 focus-within:ring-offset-2 focus-within:ring-offset-background"
        aria-label={isPlaying ? '音楽を停止' : '音楽を再生'}

        title={isPlaying ? '音楽を停止する' : '音楽を再生する'}
      >
        <div 
          className="w-6 h-6 flex justify-center items-end gap-1.5"
          role="img"
          aria-label={isPlaying ? '音楽再生中のビジュアライザー' : '音楽停止中のビジュアライザー'}
        >
          {VISUALIZER_KEYS.map((key, index) => {
            const barClassName = styles.bar;
            return (
              <span
                key={key}
                ref={(el) => {
                  barsRef.current[index] = el;
                }}
                className={barClassName}
                aria-hidden="true"
                title={`ビジュアライザーバー ${index + 1}`}
              />
            );
          })}
        </div>
        <span className="sr-only">
          {isPlaying ? '音楽再生中 - クリックで停止' : '音楽停止中 - クリックで再生'}
        </span>
      </button>
    </div>
  );
}
