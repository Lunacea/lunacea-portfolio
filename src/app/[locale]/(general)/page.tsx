'use client';

import ModernAudioVisualizer from '@/components/ModernAudioVisualizer';
import Link from 'next/link';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Lunacea Portfolio
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            インタラクティブな3Dビジュアライゼーションとオーディオリアクティブアート
          </p>
        </div>

        {/* メインビジュアライザー */}
        <div className="flex justify-center mb-16">
          <div className="relative">
            <ModernAudioVisualizer size={500} className="mx-auto" />
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <p className="text-sm text-gray-400 text-center">
                🎵 統合されたBGMシステムとビジュアライザー
              </p>
            </div>
          </div>
        </div>

        {/* プロジェクトグリッド */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Link href="/ja/circular-audio-visualizer" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 group-hover:scale-105">
              <div className="text-4xl mb-4">🌊</div>
              <h3 className="text-xl font-semibold mb-2">円形オーディオビジュアライザー</h3>
              <p className="text-gray-400">音階に合った周波数で美しい円形波を生成</p>
            </div>
          </Link>

          <Link href="/ja/audio-reactive-city" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 group-hover:scale-105">
              <div className="text-4xl mb-4">🏙️</div>
              <h3 className="text-xl font-semibold mb-2">オーディオリアクティブ都市</h3>
              <p className="text-gray-400">音楽に反応する3D都市景観</p>
            </div>
          </Link>

          <Link href="/ja/interactive-sphere" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 group-hover:scale-105">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">インタラクティブ球体</h3>
              <p className="text-gray-400">ドラッグ操作可能な動的グラデーション球体</p>
            </div>
          </Link>

          <Link href="/ja/neumorphic-demo" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 group-hover:scale-105">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">ニューモーフィズムデモ</h3>
              <p className="text-gray-400">動的グラデーションのニューモーフィック要素</p>
            </div>
          </Link>

          <Link href="/ja/monochrome-city" className="group">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 group-hover:scale-105">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-2">モノクロ都市</h3>
              <p className="text-gray-400">ミニマルな3D都市景観</p>
            </div>
          </Link>

          <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-lg border border-gray-600 border-dashed">
            <div className="text-4xl mb-4 opacity-50">✨</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-400">Coming Soon</h3>
            <p className="text-gray-500">新しいプロジェクトを準備中...</p>
          </div>
        </div>

        {/* 特徴セクション */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">🎯 統合システムの特徴</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎵</div>
              <h4 className="font-semibold mb-1">統一音源</h4>
              <p className="text-sm text-gray-400">競合のない単一BGMシステム</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="text-2xl mb-2">🔊</div>
              <h4 className="font-semibold mb-1">音量安定性</h4>
              <p className="text-sm text-gray-400">改良された音量制御</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="text-2xl mb-2">🎨</div>
              <h4 className="font-semibold mb-1">美しいUI</h4>
              <p className="text-sm text-gray-400">モダンなコントロールデザイン</p>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold mb-1">ハイドレーション対応</h4>
              <p className="text-sm text-gray-400">SSR/CSR完全対応</p>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-gray-400">
            Created with React Three Fiber, Web Audio API, Howler.js and Next.js
          </p>
        </div>
      </div>
    </div>
  );
}
