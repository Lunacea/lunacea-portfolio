import { config, library } from '@fortawesome/fontawesome-svg-core';
import {
  faBars,
  faClose,
  faMusic,
  faPause,
  faPlay,
  faSpinner,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';

// FOUC (Flash of Unstyled Content) を防ぐため、Font AwesomeのCSSを無効化
// Next.jsのCSSインポートで管理
config.autoAddCss = false;

// パフォーマンス最適化設定
config.autoAddCss = false; // CSS自動注入を無効化（Next.jsで管理）
config.keepOriginalSource = false; // ソース保持を無効化（軽量化）
config.observeMutations = false; // DOM変更監視を無効化（パフォーマンス向上）

// 頻繁に使用するアイコンを事前にライブラリに追加
library.add(
  faMusic,
  faPlay,
  faPause,
  faSpinner,
  faClose,
  faBars,
  faVolumeHigh,
);
