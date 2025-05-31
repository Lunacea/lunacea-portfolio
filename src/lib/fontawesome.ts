import { config, library } from '@fortawesome/fontawesome-svg-core';
import {
  faGithub,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';
import {
  faArrowLeft,
  faAward,
  faBars,
  faBriefcase,
  faCalendar,
  faClock,
  faClose,
  faCodeBranch,
  faEdit,
  faEnvelope,
  faGlobe,
  faGraduationCap,
  faHeart,
  faLightbulb,
  faMapMarkerAlt,
  faMicroscope,
  faMoon,
  faMusic,
  faPause,
  faPlay,
  faSpinner,
  faSun,
  faTag,
  faUsers,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons';
// import '@fortawesome/fontawesome-svg-core/styles.css'; // この行を削除またはコメントアウト

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
  faGithub,
  faXTwitter,
  faMoon,
  faSun,
  faEnvelope,
  faCalendar,
  faClock,
  faEdit,
  faTag,
  faArrowLeft,
  faGlobe,
  faMapMarkerAlt,
  faGraduationCap,
  faAward,
  faBriefcase,
  faCodeBranch,
  faMicroscope,
  faUsers,
  faLightbulb,
  faHeart,
);
