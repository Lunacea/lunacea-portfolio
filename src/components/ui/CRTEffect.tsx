'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// クリップパスグリッチのスタイル定義
const glitchStyles = `
  @keyframes noise-anim {
    0% { clip-path: inset(40% 0 61% 0); }
    5% { clip-path: inset(92% 0 1% 0); }
    10% { clip-path: inset(43% 0 1% 0); }
    15% { clip-path: inset(25% 0 58% 0); }
    20% { clip-path: inset(79% 0 6% 0); }
    25% { clip-path: inset(60% 0 13% 0); }
    30% { clip-path: inset(7% 0 94% 0); }
    35% { clip-path: inset(96% 0 3% 0); }
    40% { clip-path: inset(39% 0 19% 0); }
    45% { clip-path: inset(27% 0 37% 0); }
    50% { clip-path: inset(92% 0 7% 0); }
    55% { clip-path: inset(2% 0 68% 0); }
    60% { clip-path: inset(15% 0 79% 0); }
    65% { clip-path: inset(100% 0 1% 0); }
    70% { clip-path: inset(58% 0 42% 0); }
    75% { clip-path: inset(14% 0 51% 0); }
    80% { clip-path: inset(21% 0 21% 0); }
    85% { clip-path: inset(28% 0 23% 0); }
    90% { clip-path: inset(73% 0 5% 0); }
    95% { clip-path: inset(47% 0 46% 0); }
    100% { clip-path: inset(10% 0 50% 0); }
  }

  @keyframes noise-anim-2 {
    0% { clip-path: inset(19% 0 9% 0); }
    5% { clip-path: inset(72% 0 3% 0); }
    10% { clip-path: inset(67% 0 33% 0); }
    15% { clip-path: inset(9% 0 38% 0); }
    20% { clip-path: inset(82% 0 9% 0); }
    25% { clip-path: inset(32% 0 67% 0); }
    30% { clip-path: inset(75% 0 4% 0); }
    35% { clip-path: inset(39% 0 29% 0); }
    40% { clip-path: inset(56% 0 36% 0); }
    45% { clip-path: inset(3% 0 28% 0); }
    50% { clip-path: inset(82% 0 5% 0); }
    55% { clip-path: inset(6% 0 83% 0); }
    60% { clip-path: inset(55% 0 8% 0); }
    65% { clip-path: inset(64% 0 35% 0); }
    70% { clip-path: inset(17% 0 14% 0); }
    75% { clip-path: inset(96% 0 2% 0); }
    80% { clip-path: inset(32% 0 31% 0); }
    85% { clip-path: inset(69% 0 16% 0); }
    90% { clip-path: inset(39% 0 56% 0); }
    95% { clip-path: inset(21% 0 37% 0); }
    100% { clip-path: inset(75% 0 19% 0); }
  }

  .crt-glitch-container::before {
    content: attr(data-content);
    position: absolute;
    left: -2px;
    top: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    color: rgba(255,0,0,0.8);
    overflow: hidden;
    clip-path: inset(40% 0 40% 0);
    animation: noise-anim 4s infinite linear alternate-reverse;
    mix-blend-mode: screen;
    pointer-events: none;
    display: var(--glitch-display, none);
  }

  .crt-glitch-container::after {
    content: attr(data-content);
    position: absolute;
    left: 2px;
    top: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    color: rgba(0,0,255,0.8);
    overflow: hidden;
    clip-path: inset(40% 0 40% 0);
    animation: noise-anim-2 3s infinite linear alternate-reverse;
    mix-blend-mode: screen;
    pointer-events: none;
    display: var(--glitch-display, none);
  }

  .crt-glitch-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .crt-glitch-active .crt-glitch-container::before,
  .crt-glitch-active .crt-glitch-container::after {
    --glitch-display: block;
  }
`;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform float uNoiseIntensity;
  uniform float uScanlineIntensity;
  uniform float uScanlineCount;
  uniform float uNormalScanlineIntensity;
  uniform float uRgbShiftIntensity;
  uniform float uGlitchIntensity;
  uniform vec2 uClickPosition;
  uniform float uClickIntensity;
  uniform float uAutoGlitchIntensity;
  uniform float uGlitchTriggerTime;
  uniform float uGlitchDuration;
  uniform float uMovingScanlineSpeed;
  uniform float uMovingScanlineIntensity;
  varying vec2 vUv;
  
  // 乱数生成
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }
  
  // 改良されたノイズ関数（より細かい粒度）
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  // より高品質のFBM（Fractal Brownian Motion）ノイズ
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    // オクターブを重ねることで、より自然なノイズパターンを生成
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(st * frequency);
      frequency *= 2.2;
      amplitude *= 0.5;
    }
    return value;
  }

  // スライスグリッチ関数
  vec2 sliceGlitch(vec2 uv, float time, float intensity) {
    float sliceY = floor(uv.y * 20.0) / 20.0;
    float rand = random(vec2(sliceY, time));
    
    if (rand < intensity * 0.5) {
      float sliceX = 0.1 * sin(rand * 6.28) * intensity;
      uv.x = fract(uv.x + sliceX);
    }
    
    return uv;
  }

  void main() {
    vec2 uv = vUv;
    vec3 color = vec3(0.0);
    
    // 時間に基づくグリッチタイミング
    float glitchTime = floor(uTime * 10.0) / 10.0;
    float randomValue = random(vec2(glitchTime));
    
    // ランダムな期間でグリッチを発生させる
    float timeSinceGlitchTrigger = uTime - uGlitchTriggerTime;
    float glitchProgress = clamp(timeSinceGlitchTrigger / uGlitchDuration, 0.0, 1.0);
    float isGlitchActive = 1.0 - step(1.0, glitchProgress); // グリッチ期間中は1.0、それ以外は0.0
    
    // インタラクションの強度 (クリック時のみ使用)
    float interactionIntensity = uClickIntensity;
    
    // 短い期間中に複数回発生するノイズパターン (グリッチ時のみ)
    float fastTime = uTime * 10.0;
    float rapidGlitchPattern = step(0.7, random(vec2(floor(fastTime * isGlitchActive))));
    
    // 自動グリッチライン (グリッチ中のみ)
    float autoGlitchLine = isGlitchActive * 
                         step(0.9, random(vec2(floor(uv.y * 20.0), floor(fastTime)))) * 
                         rapidGlitchPattern;
                         
    // 横線状のグリッチエフェクト (グリッチ中のみ)
    float glitchLineHeight = 0.005 + 0.015 * random(vec2(glitchTime * 10.0));
    float glitchLine = isGlitchActive * step(0.995, random(vec2(floor(uv.y / glitchLineHeight), glitchTime * 5.0)));
    
    // クリック時の横線エフェクト
    float clickEffect = 0.0;
    float verticalDistance = abs(uv.y - uClickPosition.y);
    if (verticalDistance < 0.1 && interactionIntensity > 0.0) {
      clickEffect = (1.0 - verticalDistance / 0.1) * interactionIntensity;
    }
    
    float clickGlitchLine = step(0.85, random(vec2(floor((uv.y + uClickPosition.y) / glitchLineHeight), glitchTime))) * interactionIntensity;
    
    // グリッチの強度を計算
    float glitchOffset = (glitchLine * uGlitchIntensity * 0.1 + 
                         clickGlitchLine * clickEffect * 0.2 + 
                         autoGlitchLine * uAutoGlitchIntensity) * random(vec2(glitchTime));
    
    // 横線状にUVをずらす
    if (glitchLine > 0.5 || (clickGlitchLine > 0.5 && clickEffect > 0.0) || autoGlitchLine > 0.5) {
      uv.x += glitchOffset * (random(vec2(glitchTime + uv.y)) * 2.0 - 1.0);
    }
    
    // RGB分離効果
    float rgbShift = (uRgbShiftIntensity * (isGlitchActive + interactionIntensity)) * (0.5 + 0.5 * sin(uTime));
    float redOffset = rgbShift * random(vec2(glitchTime));
    float blueOffset = rgbShift * random(vec2(glitchTime + 1.0));
    
    // 波形ノイズ - アクティブな場合のみ
    float isActive = max(isGlitchActive, interactionIntensity);
    float dynamicNoise = fbm(uv * 150.0 + vec2(uTime * 0.15, 0.0)) * (uNoiseIntensity * isActive);
    
    // スキャンライン - アクティブな場合のみ
    float scanline = sin(uv.y * uScanlineCount * 3.14159 * 2.0) * 0.5 + 0.5;
    scanline = pow(scanline, 2.0);
    
    // 常に表示されるスキャンラインと、グリッチ時に強調されるスキャンラインを分離
    float normalScanline = scanline * uNormalScanlineIntensity;
    float activeScanline = scanline * (uScanlineIntensity * isActive);
    float totalScanline = max(normalScanline, activeScanline);
    
    // 移動走査線 - グリッチ時のみ
    float movingScanlinePos = fract(uTime * uMovingScanlineSpeed);
    float movingScanline = smoothstep(0.0, 0.01, abs(uv.y - movingScanlinePos));
    if (isGlitchActive > 0.5 && random(vec2(floor(uTime))) > 0.8) {
      movingScanline += smoothstep(0.0, 0.01, abs(uv.y - fract(movingScanlinePos + 0.5)));
    }
    float scanlineEffect = isGlitchActive > 0.0 ? (1.0 - movingScanline * uMovingScanlineIntensity) : 1.0;
    
    // カラフルな色
    vec3 baseColor;
    float colorMix = dynamicNoise * 2.0 + autoGlitchLine * 2.0 + clickEffect * 1.5;
    
    if (colorMix < 1.0) {
      baseColor = mix(vec3(0.8, 0.2, 0.7), vec3(0.2, 0.7, 0.9), colorMix); // パープル→シアン
    } else if (colorMix < 2.0) {
      baseColor = mix(vec3(0.2, 0.7, 0.9), vec3(1.0, 0.4, 0.1), colorMix - 1.0); // シアン→オレンジ
    } else {
      baseColor = mix(vec3(1.0, 0.4, 0.1), vec3(0.8, 0.2, 0.7), colorMix - 2.0); // オレンジ→パープル
    }
    
    // glitchLineごとに異なる色を適用
    vec3 lineColor = baseColor;
    
    // グリッチライン位置に基づいてランダムに色相をシフト
    if (autoGlitchLine > 0.5 || glitchLine > 0.5 || clickGlitchLine > 0.5) {
      float lineSeed = random(vec2(floor(uv.y * 100.0), glitchTime));
      
      if (lineSeed < 0.33) {
        lineColor = baseColor.gbr; // 色相を120度回転
      } else if (lineSeed < 0.66) {
        lineColor = baseColor.brg; // 色相を240度回転
      } else {
        lineColor = vec3(1.0 - baseColor.r * 0.8, 1.0 - baseColor.g * 0.8, 1.0 - baseColor.b * 0.8);
      }
    }
    
    // 背景色
    vec3 bgColor = vec3(0.08, 0.08, 0.15) + vec3(dynamicNoise * 0.15);
    
    // 基本色を合成
    vec3 effectColor;
    effectColor.r = (1.0 - (1.0 - dynamicNoise) * (1.0 - totalScanline) * 0.92) * (0.6 + baseColor.r * 0.4);
    effectColor.g = (1.0 - (1.0 - dynamicNoise) * (1.0 - totalScanline) * 0.9) * (0.6 + baseColor.g * 0.4);
    effectColor.b = (1.0 - (1.0 - dynamicNoise) * (1.0 - totalScanline) * 0.88) * (0.6 + baseColor.b * 0.4);
    
    // エフェクトの強さ - 通常時も常にCRT効果を表示する
    float effectStrength = 1.0; // 常に表示
    
    // 移動走査線の効果を適用
    effectColor *= scanlineEffect;
    
    // グリッチ時の色変化
    if (glitchLine > 0.5 || autoGlitchLine > 0.5 || clickEffect > 0.3) {
      effectColor = mix(effectColor, lineColor, 0.2 + clickEffect * 0.2 + autoGlitchLine * 0.3);
    }
    
    // 最終的な色
    color = mix(bgColor, effectColor, effectStrength);
    
    // フェードアウトするビネット
    float vignette = 1.0 - length(uv * 2.0 - 1.0) * 0.6;
    vignette = smoothstep(0.0, 1.0, vignette);
    color *= vignette;
    
    gl_FragColor = vec4(color, 0.5);
  }
`;

// 初期化時に一度だけ作成するuniform定義
const defaultUniforms = {
  uTime: { value: 0 },
  uResolution: { value: new THREE.Vector2(1, 1) },
  uNoiseIntensity: { value: 0.08 },
  uScanlineIntensity: { value: 0.12 },
  uScanlineCount: { value: 250 },
  uNormalScanlineIntensity: { value: 0.08 }, // 通常時の走査線強度
  uRgbShiftIntensity: { value: 0.005 },
  uGlitchIntensity: { value: 0.2 }, // 強度を少し下げる
  uClickPosition: { value: new THREE.Vector2(0.5, 0.5) },
  uClickIntensity: { value: 0.0 },
  uAutoGlitchIntensity: { value: 0.25 }, // 強度を下げる
  uGlitchTriggerTime: { value: 0 },
  uGlitchDuration: { value: 0.2 },
  uMovingScanlineSpeed: { value: 0.08 },
  uMovingScanlineIntensity: { value: 0.3 },
};

type CRTEffectMaterialProps = {
  onGlitchChange?: (isGlitching: boolean) => void;
};

function CRTEffectMaterial({ onGlitchChange }: CRTEffectMaterialProps) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const [clickPos, setClickPos] = useState<[number, number]>([0.5, 0.5]);
  const [clickIntensity, setClickIntensity] = useState<number>(0.0);
  const timeoutsRef = useRef<number[]>([]);
  const [glitchTriggerTime, setGlitchTriggerTime] = useState(0);
  const [glitchDuration, setGlitchDuration] = useState(0.2);
  const { size } = useThree();

  // 関数への参照を保持するためのref
  const onGlitchChangeRef = useRef(onGlitchChange);

  // onGlitchChangeが変更されたら参照を更新
  useEffect(() => {
    onGlitchChangeRef.current = onGlitchChange;
  }, [onGlitchChange]);

  // useMemoを使って初期化時に一度だけuniformsを作成
  const uniforms = useMemo(() => ({ ...defaultUniforms }), []);

  // タイムアウトをクリアする関数
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(id => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  // 安全にsetTimeoutを使用する関数
  const safeSetTimeout = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter(t => t !== id);
      callback();
    }, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // グリッチイベントをトリガーする関数をuseRefに格納して依存サイクルを避ける
  const triggerGlitchRef = useRef<(() => void) | null>(null);

  // グリッチイベントをトリガーする関数の実装
  triggerGlitchRef.current = () => {
    const currentTime = performance.now() / 1000;
    setGlitchTriggerTime(currentTime);

    // グリッチ期間は短く（0.05〜0.15秒）
    const newDuration = 0.05 + Math.random() * 0.15;
    setGlitchDuration(newDuration);

    // 親コンポーネントにグリッチ状態を通知
    if (onGlitchChangeRef.current) {
      onGlitchChangeRef.current(true);

      // グリッチ終了時に状態を戻す
      safeSetTimeout(() => {
        if (onGlitchChangeRef.current) {
          onGlitchChangeRef.current(false);
        }
      }, newDuration * 1000);
    }

    // 次のグリッチまでの待機時間（7〜15秒）- より頻繁に
    const nextDelay = 7000 + Math.random() * 8000;
    safeSetTimeout(triggerGlitchRef.current!, nextDelay);
  };

  // 定期的にグリッチを発生させる
  useEffect(() => {
    // 最初のグリッチをスケジュール（少し遅らせる）
    const initialDelay = 2000 + Math.random() * 5000;
    safeSetTimeout(triggerGlitchRef.current!, initialDelay);

    return clearAllTimeouts;
  }, [safeSetTimeout, clearAllTimeouts]);

  // クリック時のインタラクション
  const handleInteraction = (x: number, y: number) => {
    // クリック位置を中心に少しランダム性を追加（ランダム性を小さく）
    const randomOffsetX = (Math.random() * 0.02) - 0.01;
    const randomOffsetY = (Math.random() * 0.02) - 0.01;
    setClickPos([x + randomOffsetX, 1.0 - y + randomOffsetY]); // Y軸は反転

    // 最大強度でスタート（強度を下げる）
    setClickIntensity(0.8);

    // 派手な連続グリッチ効果のためのランダムなタイムライン（値を下げる）
    const createGlitchTimeline = () => {
      // 初期強度
      safeSetTimeout(() => setClickIntensity(0.7), 50 + Math.random() * 30);
      safeSetTimeout(() => setClickIntensity(0.8), 100 + Math.random() * 30);
      safeSetTimeout(() => setClickIntensity(0.6), 150 + Math.random() * 30);
      safeSetTimeout(() => setClickIntensity(0.75), 200 + Math.random() * 30);
      safeSetTimeout(() => setClickIntensity(0.4), 250 + Math.random() * 30);
      safeSetTimeout(() => setClickIntensity(0.6), 300 + Math.random() * 30);
      safeSetTimeout(() => setClickIntensity(0.2), 350 + Math.random() * 30);
      safeSetTimeout(() => setClickIntensity(0.1), 400 + Math.random() * 30);
      safeSetTimeout(() => setClickIntensity(0.0), 450 + Math.random() * 30);
    };

    // 派手なグリッチエフェクトを実行
    createGlitchTimeline();

    // 親コンポーネントにグリッチ状態を通知
    if (onGlitchChangeRef.current) {
      onGlitchChangeRef.current(true);
      safeSetTimeout(() => {
        if (onGlitchChangeRef.current) {
          onGlitchChangeRef.current(false);
        }
      }, 500);
    }
  };

  // handleInteractionへの参照を保持するためのref
  const handleInteractionRef = useRef(handleInteraction);

  // handleInteractionが変更されたら参照を更新
  useEffect(() => {
    handleInteractionRef.current = handleInteraction;
  });

  // クリックとタッチイベントの処理
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      handleInteractionRef.current(event.clientX / window.innerWidth, event.clientY / window.innerHeight);
    };

    const handleTouch = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        if (touch) {
          handleInteractionRef.current(touch.clientX / window.innerWidth, touch.clientY / window.innerHeight);
        }
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouch);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  // uniformsの更新
  useEffect(() => {
    if (materialRef.current?.uniforms) {
      const material = materialRef.current;
      if (material.uniforms.uClickPosition && material.uniforms.uClickPosition.value) {
        material.uniforms.uClickPosition.value.set(clickPos[0], clickPos[1]);
      }
      if (material.uniforms.uClickIntensity) {
        material.uniforms.uClickIntensity.value = clickIntensity;
      }
      if (material.uniforms.uGlitchTriggerTime) {
        material.uniforms.uGlitchTriggerTime.value = glitchTriggerTime;
      }
      if (material.uniforms.uGlitchDuration) {
        material.uniforms.uGlitchDuration.value = glitchDuration;
      }
    }
  }, [clickPos, clickIntensity, glitchTriggerTime, glitchDuration]);

  // アニメーションフレーム
  useFrame(({ clock }) => {
    if (materialRef.current?.uniforms) {
      const uniforms = materialRef.current.uniforms;
      if (uniforms.uTime) {
        uniforms.uTime.value = clock.getElapsedTime();
      }
      if (uniforms.uResolution && uniforms.uResolution.value) {
        uniforms.uResolution.value.set(size.width, size.height);
      }
    }
  });

  return (
    <mesh position={[0, 0, 0]} scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

type CRTEffectProps = {
  className?: string;
};

export default function CRTEffect({ className }: CRTEffectProps) {
  const [showCssGlitch, setShowCssGlitch] = useState(false);
  const glitchContentRef = useRef<HTMLDivElement>(null);

  // WebGLグリッチとCSSグリッチを同期
  const handleGlitchChange = (isGlitching: boolean) => {
    setShowCssGlitch(isGlitching);
  };

  // スナップショットを撮影して画像データを取得
  useEffect(() => {
    const captureScreenshot = () => {
      const container = glitchContentRef.current;
      if (container) {
        // 現在のビューを記録（画面のスナップショットとして使用）
        container.setAttribute('data-content', '');
      }
    };

    // 定期的にスナップショットを更新
    const intervalId = setInterval(captureScreenshot, 2000);

    return () => clearInterval(intervalId);
  }, []);

  // ウィンドウのリサイズに対応する
  useEffect(() => {
    const handleResize = () => {
      // リサイズ時にスナップショットを更新
      const container = glitchContentRef.current;
      if (container) {
        container.setAttribute('data-content', '');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`${className || ''} w-full h-full relative overflow-hidden`}>
      <style>{glitchStyles}</style>

      <div
        ref={glitchContentRef}
        className={`crt-glitch-container absolute inset-0 z-10 pointer-events-none ${showCssGlitch ? 'crt-glitch-active' : ''}`}
        data-content=""
      />

      <div className="absolute inset-0 z-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 0, 1] }}
          className="w-full h-full block"
          resize={{ scroll: false, offsetSize: true }}
        >
          <CRTEffectMaterial onGlitchChange={handleGlitchChange} />
        </Canvas>
      </div>
    </div>
  );
}
