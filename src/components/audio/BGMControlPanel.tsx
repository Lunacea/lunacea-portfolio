'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { MusicIcon, PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from 'lucide-react';

type BGMControlPanelProps = {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onTogglePlaybackAction: () => void;
  onVolumeChangeAction: (values: number[]) => void;
  onToggleMuteAction: () => void;
};

export const BGMControlPanel: React.FC<BGMControlPanelProps> = ({
  isPlaying,
  volume,
  isMuted,
  onTogglePlaybackAction,
  onVolumeChangeAction,
  onToggleMuteAction,
}) => {
  return (
    <Card className="w-64 shadow-lg border-border/50 backdrop-blur-sm bg-background/95">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MusicIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">BGM コントロール</span>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              isPlaying
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
            >
              {isPlaying ? '再生中' : '停止中'}
            </div>
          </div>

          {/* 音量コントロール */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">音量</span>
              <span className="text-sm font-medium">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onToggleMuteAction}
                className="h-8 w-8 shrink-0"
                aria-label={isMuted ? 'ミュート解除' : 'ミュート'}
              >
                {isMuted
                  ? (
                      <VolumeXIcon className="h-4 w-4" />
                    )
                  : (
                      <Volume2Icon className="h-4 w-4" />
                    )}
              </Button>

              <div className="flex-1">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={onVolumeChangeAction}
                  max={100}
                  step={1}
                  disabled={isMuted}
                  className="w-full"
                  aria-label="音量調整"
                />
              </div>
            </div>
          </div>

          {/* 再生コントロール */}
          <div className="flex items-center justify-center pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onTogglePlaybackAction}
              className="flex items-center gap-2"
              aria-label={isPlaying ? 'BGMを一時停止' : 'BGMを再生'}
            >
              {isPlaying
                ? (
                    <>
                      <PauseIcon className="h-4 w-4" />
                      一時停止
                    </>
                  )
                : (
                    <>
                      <PlayIcon className="h-4 w-4" />
                      再生
                    </>
                  )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
