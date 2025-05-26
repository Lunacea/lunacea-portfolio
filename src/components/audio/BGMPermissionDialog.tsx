'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MusicIcon } from 'lucide-react';

type BGMPermissionDialogProps = {
  open: boolean;
  onAllowAction: () => void;
  onDenyAction: () => void;
};

export const BGMPermissionDialog: React.FC<BGMPermissionDialogProps> = ({
  open,
  onAllowAction,
  onDenyAction,
}) => {
  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md z-99 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <MusicIcon className="h-5 w-5 text-blue-600" />
            BGM再生の許可
          </DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-gray-300">
            このサイトではBGMを再生します。音楽の再生を許可しますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onDenyAction}
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
          >
            拒否
          </Button>
          <Button
            type="button"
            onClick={onAllowAction}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            許可
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
