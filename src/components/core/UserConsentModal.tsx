'use client';

import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@/components/Icon';
import { useBGMStore } from '@/stores/bgm';

export const UserConsentModal = () => {
  const hasUserConsent = useBGMStore(state => state.hasUserConsent);
  const grantConsent = useBGMStore(state => state.grantConsent);
  const denyConsent = useBGMStore(state => state.denyConsent);

  if (hasUserConsent !== null) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-xl border border-white/20 max-w-md">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Icon icon={faMusic} />
          Welcome to LUNACEA Portfolio
        </h3>
        <p className="text-gray-300 mb-6">
          このサイトでは音楽が流れます。
          <br />
          音楽を再生しますか？
        </p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={grantConsent}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
          >
            ON
          </button>
          <button
            type="button"
            onClick={denyConsent}
            className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all duration-200"
          >
            OFF
          </button>
        </div>
      </div>
    </div>
  );
};
