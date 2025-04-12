'use client'; // クライアントコンポーネントとしてマーク

import type { ColorRatiosType } from './context/ColorRatiosContext';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ColorRatiosProvider } from './ColorRatiosProvider';
import { useColorRatios } from './hooks/useColorRatios';

const waveVertexShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const waveFragmentShader = /* glsl */ `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3 waveColor;
uniform vec2 mousePos;
uniform int enableMouseInteraction;
uniform float mouseRadius;
uniform float blueRatio; // 青色の比率
uniform float greenRatio; // 緑色の比率
uniform float yellowRatio; // 黄色の比率

vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 8;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p - fbm(p + fbm(p2)));
}

// 青、緑、黄色のテーマカラー - より明確な違いのために色を強調
vec3 blueColor = vec3(0.1, 0.3, 1.0);   // より鮮やかな青
vec3 greenColor = vec3(0.1, 0.9, 0.3);  // より鮮やかな緑
vec3 yellowColor = vec3(1.0, 0.9, 0.1); // より鮮やかな黄

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;
  float f = pattern(uv);
  
  if (enableMouseInteraction == 1) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x *= resolution.x / resolution.y;
    float dist = length(uv - mouseNDC);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    f -= 0.5 * effect;
  }
  
  // パターン値とUV座標に基づいてカラーグラデーションを作成
  vec3 col;
  // mod関数を使用して0～1の範囲で循環させる
  float t = mod(uv.y + uv.x + f * 0.5 + time * 0.1, 1.0);
  
  // 色の割合を正規化
  float totalRatio = blueRatio + greenRatio + yellowRatio;
  float normBlueRatio = blueRatio / totalRatio;
  float normGreenRatio = greenRatio / totalRatio;
  float normYellowRatio = yellowRatio / totalRatio;
  
  // 色の境界値を計算
  float blueTreshold = normBlueRatio;
  float greenTreshold = blueTreshold + normGreenRatio;
  
  // 青→緑→黄→青のグラデーションを作成
  if (t < blueTreshold) {
    // 青から緑へのグラデーション
    col = mix(blueColor, greenColor, smoothstep(0.0, blueTreshold, t) / blueTreshold);
  } else if (t < greenTreshold) {
    // 緑から黄色へのグラデーション
    col = mix(greenColor, yellowColor, smoothstep(blueTreshold, greenTreshold, t) * (1.0 / normGreenRatio) - (blueTreshold / normGreenRatio));
  } else {
    // 黄色から青へのグラデーション
    col = mix(yellowColor, blueColor, smoothstep(greenTreshold, 1.0, t) * (1.0 / normYellowRatio) - (greenTreshold / normYellowRatio));
  }
  
  // 最小の明るさを設定して黒を防止
  float minBrightness = 0.4;
  // 元の波のパターンをカラーの強度として使用するが、最小値を設定
  float intensity = mix(minBrightness, 1.0, f);
  col *= intensity;
  
  gl_FragColor = vec4(col, 1.0);
}
`;

type WaveUniforms = {
  [key: string]: THREE.Uniform<any>;
  time: THREE.Uniform<number>;
  resolution: THREE.Uniform<THREE.Vector2>;
  waveSpeed: THREE.Uniform<number>;
  waveFrequency: THREE.Uniform<number>;
  waveAmplitude: THREE.Uniform<number>;
  waveColor: THREE.Uniform<THREE.Color>;
  mousePos: THREE.Uniform<THREE.Vector2>;
  enableMouseInteraction: THREE.Uniform<number>;
  mouseRadius: THREE.Uniform<number>;
  blueRatio: THREE.Uniform<number>;
  greenRatio: THREE.Uniform<number>;
  yellowRatio: THREE.Uniform<number>;
};

type DitheredWavesProps = {
  waveSpeed: number;
  waveFrequency: number;
  waveAmplitude: number;
  waveColor: [number, number, number];
  disableAnimation: boolean;
  enableMouseInteraction: boolean;
  mouseRadius: number;
  blueRatio: number;
  greenRatio: number;
  yellowRatio: number;
};

function DitheredWaves({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  waveColor,
  disableAnimation,
  enableMouseInteraction,
  mouseRadius,
  blueRatio,
  greenRatio,
  yellowRatio,
}: DitheredWavesProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const [mousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // setMousePosは未使用
  const { viewport, size, gl } = useThree();

  const waveUniformsRef = useRef<WaveUniforms>({
    time: new THREE.Uniform(0),
    resolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
    waveSpeed: new THREE.Uniform(waveSpeed),
    waveFrequency: new THREE.Uniform(waveFrequency),
    waveAmplitude: new THREE.Uniform(waveAmplitude),
    waveColor: new THREE.Uniform(new THREE.Color(...waveColor)),
    mousePos: new THREE.Uniform(new THREE.Vector2(0, 0)),
    enableMouseInteraction: new THREE.Uniform(enableMouseInteraction ? 1 : 0),
    mouseRadius: new THREE.Uniform(mouseRadius),
    blueRatio: new THREE.Uniform(blueRatio),
    greenRatio: new THREE.Uniform(greenRatio),
    yellowRatio: new THREE.Uniform(yellowRatio),
  });

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    const newWidth = Math.floor(size.width * dpr);
    const newHeight = Math.floor(size.height * dpr);
    const currentRes = waveUniformsRef.current.resolution.value;
    if (currentRes.x !== newWidth || currentRes.y !== newHeight) {
      currentRes.set(newWidth, newHeight);
    }
  }, [size, gl]);

  useFrame(({ clock }) => {
    if (!disableAnimation) {
      waveUniformsRef.current.time.value = clock.getElapsedTime();
    }
    waveUniformsRef.current.waveSpeed.value = waveSpeed;
    waveUniformsRef.current.waveFrequency.value = waveFrequency;
    waveUniformsRef.current.waveAmplitude.value = waveAmplitude;
    waveUniformsRef.current.waveColor.value.set(...waveColor);
    waveUniformsRef.current.enableMouseInteraction.value
      = enableMouseInteraction ? 1 : 0;
    waveUniformsRef.current.mouseRadius.value = mouseRadius;
    waveUniformsRef.current.blueRatio.value = blueRatio;
    waveUniformsRef.current.greenRatio.value = greenRatio;
    waveUniformsRef.current.yellowRatio.value = yellowRatio;
    if (enableMouseInteraction) {
      waveUniformsRef.current.mousePos.value.set(mousePos.x, mousePos.y);
    }
  });

  return (
    <>
      <mesh ref={mesh} scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={waveUniformsRef.current}
        />
      </mesh>
    </>
  );
}

// デフォルト値をコンポーネント外部に定義
const DEFAULT_WAVE_COLOR: [number, number, number] = [0.0, 0.5, 0.8];

// キャンバス部分のみを扱うコンポーネント
export function DitherCanvas({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  waveColor = DEFAULT_WAVE_COLOR,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 1,
  className = '',
}: {
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  waveColor?: [number, number, number];
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  className?: string;
}) {
  const { colorRatios } = useColorRatios();
  const [dpr] = useState(() => {
    // クライアントサイドでのみdevicePixelRatioにアクセス
    if (typeof window !== 'undefined') {
      return window.devicePixelRatio;
    }
    return 1;
  });

  return (
    <Canvas
      className={`w-full h-full ${className}`}
      camera={{ position: [0, 0, 6] }}
      dpr={dpr}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      <DitheredWaves
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        waveColor={waveColor}
        disableAnimation={disableAnimation}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
        blueRatio={colorRatios.blue}
        greenRatio={colorRatios.green}
        yellowRatio={colorRatios.yellow}
      />
    </Canvas>
  );
}

// カラートグルボタンのみを扱うコンポーネント
type ColorOption = 'blue' | 'green' | 'yellow';

export function ColorToggleButtons({
  className = '',
}: {
  className?: string;
}) {
  const { colorRatios, setColorRatios } = useColorRatios();

  const handleColorToggle = (color: ColorOption) => {
    setColorRatios((prev: ColorRatiosType) => {
      const newRatios = { ...prev };

      // 選択された色を強調（比率を上げる）- より鮮明な差をつける
      if (color === 'blue') {
        newRatios.blue = 0.8;
        newRatios.green = 0.1;
        newRatios.yellow = 0.1;
      } else if (color === 'green') {
        newRatios.blue = 0.1;
        newRatios.green = 0.8;
        newRatios.yellow = 0.1;
      } else {
        newRatios.blue = 0.1;
        newRatios.green = 0.1;
        newRatios.yellow = 0.8;
      }

      // DEBUG: コンソールに現在の色の比率を出力
      console.warn('色比率更新:', newRatios);

      return newRatios;
    });
  };

  return (
    <div className={`flex space-x-2 p-2 bg-black/60 backdrop-blur-sm rounded-lg z-99 pointer-events-auto ${className}`}>
      <ColorToggleButton
        color="blue"
        active={colorRatios.blue > colorRatios.green && colorRatios.blue > colorRatios.yellow}
        onClick={() => handleColorToggle('blue')}
      />
      <ColorToggleButton
        color="green"
        active={colorRatios.green > colorRatios.blue && colorRatios.green > colorRatios.yellow}
        onClick={() => handleColorToggle('green')}
      />
      <ColorToggleButton
        color="yellow"
        active={colorRatios.yellow > colorRatios.blue && colorRatios.yellow > colorRatios.green}
        onClick={() => handleColorToggle('yellow')}
      />
    </div>
  );
}

function ColorToggleButton({
  color,
  active,
  onClick,
}: {
  color: ColorOption;
  active: boolean;
  onClick: () => void;
}) {
  const colorMap = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
  };

  const labelMap = {
    blue: '青',
    green: '緑',
    yellow: '黄',
  };

  return (
    <button
      type="button"
      className={`px-4 py-2 rounded-md text-white transition-all ${colorMap[color]} cursor-pointer ${active ? 'ring-2 ring-white scale-110' : 'opacity-70'} pointer-events-auto`}
      onClick={onClick}
    >
      {labelMap[color]}
    </button>
  );
}

// メインのDitherコンポーネント
type DitherProps = {
  waveSpeed?: number;
  waveFrequency?: number;
  waveAmplitude?: number;
  waveColor?: [number, number, number];
  disableAnimation?: boolean;
  enableMouseInteraction?: boolean;
  mouseRadius?: number;
  blueRatio?: number;
  greenRatio?: number;
  yellowRatio?: number;
  hideColorToggle?: boolean; // 色切り替えボタンを非表示にするオプション
};

export default function Dither({
  waveSpeed = 0.05,
  waveFrequency = 3,
  waveAmplitude = 0.3,
  waveColor = DEFAULT_WAVE_COLOR,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 1,
  blueRatio = 0.6,
  greenRatio = 0.2,
  yellowRatio = 0.2,
  hideColorToggle = false, // デフォルトでは表示
}: DitherProps) {
  // 初期カラー比率を定義
  const initialColorRatios: ColorRatiosType = {
    blue: blueRatio,
    green: greenRatio,
    yellow: yellowRatio,
  };

  return (
    <ColorRatiosProvider initialRatios={initialColorRatios}>
      <div className="relative w-full h-full">
        <DitherCanvas
          waveSpeed={waveSpeed}
          waveFrequency={waveFrequency}
          waveAmplitude={waveAmplitude}
          waveColor={waveColor}
          disableAnimation={disableAnimation}
          enableMouseInteraction={enableMouseInteraction}
          mouseRadius={mouseRadius}
        />
        {!hideColorToggle && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <ColorToggleButtons />
          </div>
        )}
      </div>
    </ColorRatiosProvider>
  );
}
