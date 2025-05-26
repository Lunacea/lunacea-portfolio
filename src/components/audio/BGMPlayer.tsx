'use client';

import { Button } from '@/components/ui/button';
import { useBGMStore } from '@/stores/bgm';
import { PauseIcon, PlayIcon, SettingsIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { BGMControlPanel } from './BGMControlPanel';
import { BGMPermissionDialog } from './BGMPermissionDialog';

const BGMPlayer: React.FC = () => {
  const [showControls, setShowControls] = useState(false);

  // Zustandストアから状態とアクションを取得
  const permissionStatus = useBGMStore(state => state.permissionStatus);
  const isPlaying = useBGMStore(state => state.isPlaying);
  const needsDialogInteraction = useBGMStore(state => state.needsDialogInteraction);
  const isDialogMounted = useBGMStore(state => state.isDialogMounted);
  const isDialogAnimatedVisible = useBGMStore(state => state.isDialogAnimatedVisible);
  const volume = useBGMStore(state => state.volume);
  const isMuted = useBGMStore(state => state.isMuted);
  const handlePermissionAction = useBGMStore(state => state.handlePermission);
  const togglePlaybackAction = useBGMStore(state => state.togglePlayback);
  const setVolumeAction = useBGMStore(state => state.setVolume);
  const toggleMuteAction = useBGMStore(state => state.toggleMute);

  // アクションのメモ化
  const handlePermission = useCallback((allow: boolean) => {
    console.warn(`[BGMPlayer] Permission ${allow ? 'allowed' : 'denied'}`);
    handlePermissionAction(allow);
  }, [handlePermissionAction]);

  const handleTogglePlayback = useCallback((event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.warn('[BGMPlayer] Toggle playback');

    try {
      togglePlaybackAction();
    } catch (error) {
      console.error('[BGMPlayer] Error toggling playback:', error);
    }
  }, [togglePlaybackAction]);

  const handleVolumeChange = useCallback((values: number[]) => {
    if (values.length === 0) {
      return;
    }

    const newVolume = values[0]! / 100; // スライダーは0-100、ストアは0-1
    console.warn('[BGMPlayer] Volume changed:', newVolume);
    setVolumeAction(newVolume);
  }, [setVolumeAction]);

  const handleMuteToggle = useCallback((event?: React.MouseEvent<HTMLButtonElement>) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.warn('[BGMPlayer] Mute toggled');
    toggleMuteAction();
  }, [toggleMuteAction]);

  const handleControlsToggle = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setShowControls(!showControls);
  }, [showControls]);

  // 計算された値
  const shouldShowDialog = needsDialogInteraction && isDialogMounted;

  console.warn('[BGMPlayer] Current state:', {
    permissionStatus,
    needsDialogInteraction,
    isDialogMounted,
    isDialogAnimatedVisible,
    shouldShowDialog,
  });

  return (
    <>
      {/* 許可ダイアログのレンダリング（初回訪問時） */}
      {shouldShowDialog && (
        <BGMPermissionDialog
          open={isDialogAnimatedVisible}
          onAllowAction={() => handlePermission(true)}
          onDenyAction={() => handlePermission(false)}
        />
      )}

      {/* BGMコントロール（常に表示） */}
      <div className="fixed top-4 right-4 z-1" data-testid="bgm-player">
        {/* 拡張コントロールパネル */}
        {showControls && (
          <div className="mb-3">
            <BGMControlPanel
              isPlaying={isPlaying}
              volume={volume}
              isMuted={isMuted}
              onTogglePlaybackAction={handleTogglePlayback}
              onVolumeChangeAction={handleVolumeChange}
              onToggleMuteAction={handleMuteToggle}
            />
          </div>
        )}

        {/* メインコントロールボタン */}
        <div className="flex gap-2 z-50">
          {/* 設定ボタン */}
          <Button
            type="button"
            size="icon"
            onClick={handleControlsToggle}
            className="h-12 w-12 rounded-full shadow-2xl bg-white text-black border-2 border-gray-400 hover:bg-gray-50 hover:border-gray-600"
            aria-label="BGM設定"
          >
            <SettingsIcon className="h-5 w-5" />
          </Button>

          {/* 再生/一時停止ボタン */}
          <Button
            type="button"
            size="icon"
            onClick={handleTogglePlayback}
            className="h-12 w-12 rounded-full shadow-2xl bg-blue-600 text-white border-2 border-blue-800 hover:bg-blue-700 hover:border-blue-900"
            aria-label={isPlaying ? 'BGMを一時停止' : 'BGMを再生'}
          >
            {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </>
  );
};

export default BGMPlayer;
