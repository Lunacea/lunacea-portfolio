import { GlobalStyles } from '@/components/core/GlobalStyles';
import { BaseTemplate } from '@/components/templates/BaseTemplate';
import { ClientNavigation } from '@/components/templates/ClientNavigation';

/**
 * マーケティングセクションのレイアウトコンポーネント
 * バックグラウンドエフェクトと色調整機能を提供します
 */
export default function Layout(props: { // GeneralLayout から Layout に名称戻す
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // params の型も元に戻す (もし変更していれば)
}) {
  return (
    <>
      <GlobalStyles />
      {/* メインコンテンツ */}
      <div className="relative">
        <BaseTemplate
          leftNav={<ClientNavigation />}
        >
          {props.children}
        </BaseTemplate>
      </div>
    </>
  );
}
