'use client';

import { Howl } from 'howler';
import { useTranslations } from 'next-intl';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// 定数
const STORAGE_KEY = 'bgm-permission';
const BGM_PATH = '/assets/sound/bgm.mp3';
const VOLUME = 0.3;

// BGMプレーヤーのコンテキスト型
type BGMPermissionStatus = 'granted' | 'denied' | null;

// ヘルパー関数: localStorageから初期状態を取得
const getInitialBGMState = (): { permission: BGMPermissionStatus; showDialog: boolean } => {
  if (typeof window === 'undefined') {
    // SSR時はlocalStorageにアクセスできないためデフォルト値を返す
    return { permission: null, showDialog: false };
  }
  try {
    const savedPermission = localStorage.getItem(STORAGE_KEY) as BGMPermissionStatus;
    // console.warn(`[Initial State] Saved BGM Permission: ${savedPermission}`);
    return { permission: savedPermission, showDialog: savedPermission === null };
  } catch (e) {
    console.error('[Initial State] Error reading from localStorage:', e);
    // エラー発生時はダイアログを表示し、許可状態は未定とする
    return { permission: null, showDialog: true };
  }
};

/**
 * BGMPlayerコンポーネント
 * ページ遷移しても音楽が途切れない実装
 */
export const BGMPlayer: React.FC = () => {
  const t = useTranslations('BGMPlayer');

  // 1. 状態管理 - getInitialBGMStateを使用して初期化
  const initialState = getInitialBGMState();
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<BGMPermissionStatus>(initialState.permission);
  const [showDialog, setShowDialog] = useState<boolean>(initialState.showDialog);

  // refs - 値の維持
  const soundRef = useRef<Howl | null>(null);

  // 2. 音声再生関数 - 外部依存なし
  const playAudio = useCallback(() => {
    if (!soundRef.current) {
      return;
    }

    try {
      if (!soundRef.current.playing()) {
        console.warn('BGM再生開始');
        soundRef.current.fade(0, VOLUME, 1000);
        soundRef.current.play();
      }
    } catch (e) {
      console.error('BGM再生エラー:', e);
    }
  }, []);

  // 3. 音声停止関数 - 外部依存なし
  const pauseAudio = useCallback(() => {
    if (!soundRef.current) {
      return;
    }

    try {
      if (soundRef.current.playing()) {
        console.warn('BGM一時停止');
        soundRef.current.fade(VOLUME, 0, 500);
        setTimeout(() => {
          if (soundRef.current) {
            soundRef.current.pause();
          }
        }, 500);
      }
    } catch (e) {
      console.error('BGM一時停止エラー:', e);
    }
  }, []);

  // 4. 再生状態切り替え
  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [isPlaying, pauseAudio, playAudio]);

  // 5. パーミッション処理ハンドラ
  const handlePermission = useCallback((allow: boolean) => {
    const newStatus = allow ? 'granted' : 'denied';
    console.warn(`BGM許可設定: ${newStatus}`);

    // ローカルストレージに保存
    try {
      localStorage.setItem(STORAGE_KEY, newStatus);
    } catch (e) {
      console.error('ローカルストレージ書き込みエラー:', e);
    }

    // 状態を更新
    setPermissionStatus(newStatus);
    setShowDialog(false);

    // 許可された場合、即時再生を試みる
    if (allow) {
      // ユーザーインタラクションとして処理するため即時実行
      setTimeout(playAudio, 100);
    }
  }, [playAudio]);

  // 6. パーミッション状態の初期化 - マウント時に一度だけ実行
  // useEffect(() => {
  //   // ローカルストレージからパーミッション状態を読み込む
  //   try {
  //     const savedPermission = localStorage.getItem(STORAGE_KEY) as BGMPermissionStatus;
  //     console.warn(`保存されているBGM許可状態: ${savedPermission}`);

  //     setPermissionStatus(savedPermission);
  //     setShowDialog(savedPermission === null);
  //   } catch (e) {
  //     console.error('ローカルストレージ読み込みエラー:', e);
  //     setShowDialog(true);
  //   }
  // }, []); // 空の依存配列 - マウント時に一度だけ実行

  // Web Audio APIのアンロック処理をuseCallbackでメモ化
  const unlockAudio = useCallback(() => {
    if (typeof window !== 'undefined' && 'Howler' in window && (window as any).Howler._autoUnlock) {
      (window as any).Howler._autoUnlock();
    }
    // イベントリスナーは一度実行されると自動的に削除される({ once: true })
    // ここでの明示的な削除は不要
  }, []);

  // 7. Howlerインスタンスの初期化 - マウント時に一度だけ実行
  useEffect(() => {
    // グローバルHowler設定
    if (typeof window !== 'undefined' && 'Howler' in window) {
      (window as any).Howler.autoUnlock = true;
      (window as any).Howler.volume = VOLUME;
    }

    // インスタンスがすでに存在する場合は何もしない
    if (soundRef.current) {
      return;
    }

    // Web Audio APIのロック解除をユーザーインタラクションで行うための処理
    // この関数はuseEffect内で定義されているため、unlockAudioへの依存はない
    const setupUnlockListeners = () => {
      // unlockAudio関数をリスナーとして登録
      document.addEventListener('click', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
      document.addEventListener('touchend', unlockAudio, { once: true });
    };

    // Howlインスタンスを作成
    const bgmSound = new Howl({
      src: [BGM_PATH],
      loop: true,
      volume: VOLUME,
      preload: true,
      html5: false,
      format: ['mp3'],
      // イベントハンドラ
      onload: () => {
        console.warn('BGMロード完了');
      },
      onplay: () => {
        console.warn('BGM再生中');
        setIsPlaying(true);
      },
      onpause: () => {
        console.warn('BGM一時停止中');
        setIsPlaying(false);
      },
      onstop: () => {
        console.warn('BGM停止');
        setIsPlaying(false);
      },
      onloaderror: (_, error) => console.error('BGM読み込みエラー:', error),
      onplayerror: (_, error) => {
        console.error('BGM再生エラー:', error);
      },
    });

    // 参照を保存
    soundRef.current = bgmSound;
    console.warn('BGMインスタンス初期化完了');

    // アンロックリスナーのセットアップ
    setupUnlockListeners();

    // クリーンアップ
    return () => {
      if (soundRef.current) {
        console.warn('BGMリソースの解放');
        soundRef.current.unload();
        soundRef.current = null;
      }
      // アンロックリスナーの明示的な削除 (ESLint警告対応)
      // { once: true } で登録しているため、通常は不要だが、
      // コンポーネントアンマウント時に未発火の場合を考慮し、明示的に削除。
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('touchend', unlockAudio);
    };
  }, [unlockAudio]); // unlockAudioを依存配列に追加

  // 8. パーミッション変更時の効果
  useEffect(() => {
    // パーミッションが変更されたとき、適切な処理を行う
    if (!soundRef.current) {
      return;
    }

    if (permissionStatus === 'granted') {
      // 許可された場合、再生していなければ再生
      if (!soundRef.current.playing()) {
        console.warn('パーミッション付与により再生開始');
        playAudio();
      }
    } else if (permissionStatus === 'denied') {
      // 拒否された場合、再生中なら停止
      if (soundRef.current.playing()) {
        console.warn('パーミッション拒否により停止');
        pauseAudio();
      }
    }
    // permissionStatus === null の場合は何もしない（初期状態）
  }, [permissionStatus, playAudio, pauseAudio]);

  // レンダリング
  return (
    <>
      {/* 再生コントロールボタン - パーミッション取得済みの場合のみ表示 */}
      {permissionStatus && (
        <button
          type="button"
          onClick={togglePlayback}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-opacity-70 bg-gray-800 p-3 text-white hover:bg-opacity-100 transition-all shadow-lg"
          aria-label={isPlaying ? t('pause_bgm') : t('play_bgm')}
          title={isPlaying ? t('pause_bgm') : t('play_bgm')}
        >
          {isPlaying
            ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              )
            : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
        </button>
      )}

      {/* 許可ダイアログ */}
      {showDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[9999]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bgm-dialog-title"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm mx-4">
            <h3
              id="bgm-dialog-title"
              className="text-lg font-medium text-gray-900 dark:text-white mb-3"
            >
              {t('dialog_title')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t('dialog_message')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => handlePermission(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {t('deny')}
              </button>
              <button
                type="button"
                onClick={() => handlePermission(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ref={(el) => {
                  if (el && showDialog) {
                    setTimeout(() => el.focus(), 100);
                  }
                }}
              >
                {t('allow')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* デバッグ情報 - 開発環境のみ */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 left-2 z-[9998] bg-black bg-opacity-70 text-white text-xs p-2 rounded">
          <div>
            Permission:
            {permissionStatus || 'null'}
          </div>
          <div>
            Playing:
            {isPlaying ? 'YES' : 'NO'}
          </div>
          <div>
            Dialog:
            {showDialog ? 'SHOWN' : 'HIDDEN'}
          </div>
        </div>
      )}
    </>
  );
};
