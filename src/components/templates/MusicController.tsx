'use client';

import { faClose, faMusic, faPause, faPlay, faSpinner, faVolumeHigh } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { useBGMStore } from '@/stores/bgm';

export const MusicController = () => {
  const [isControllerExpanded, setIsControllerExpanded] = useState(false);

  // BGMストアから必要な状態とアクションを取得
  const isPlaying = useBGMStore(state => state.isPlaying);
  const isLoading = useBGMStore(state => state.isLoading);
  const volume = useBGMStore(state => state.volume);
  const play = useBGMStore(state => state.play);
  const pause = useBGMStore(state => state.pause);
  const setVolume = useBGMStore(state => state.setVolume);

  return (
    <div className="fixed bottom-6 right-6 z-99">
      {isControllerExpanded
        ? (
            <div className="bg-black/20 backdrop-blur-md rounded-lg p-4 border border-white/10 min-w-64">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon icon={faMusic} className="text-white/90" />
                  <span className="text-sm font-medium text-white/90 tracking-wide">Music</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsControllerExpanded(false)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                  aria-label="コントローラを閉じる"
                >
                  <Icon icon={faClose} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={isPlaying ? pause : play}
                    disabled={isLoading}
                    className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {isLoading ? <Icon icon={faSpinner} spin /> : isPlaying ? <Icon icon={faPause} /> : <Icon icon={faPlay} />}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <Icon icon={faVolumeHigh} className="text-white/80 text-xs" />
                        <span className="text-xs text-white/80">音量</span>
                      </div>
                      <span className="text-xs text-white">
                        {Math.round(volume * 100)}
                        %
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume * 100}
                      onChange={e => setVolume(Number(e.target.value) / 100)}
                      aria-label="音量調整"
                      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        : (
            <button
              type="button"
              onClick={() => setIsControllerExpanded(true)}
              className="w-16 h-16 hover:bg-white/5 rounded-full flex items-center justify-center transition-all duration-200 group border border-white/10 backdrop-blur-md"
              aria-label="音楽コントローラを開く"
            >
              <Icon
                icon={isPlaying ? faMusic : faPlay}
                className="text-white/70 hover:text-white text-xl group-hover:scale-110 transition-all duration-200"
              />
            </button>
          )}
    </div>
  );
};
