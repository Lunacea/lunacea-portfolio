import { GlobalStyles } from '@/components/core/GlobalStyles';
import { BaseTemplate } from '@/components/templates/BaseTemplate';
import { ClientNavigation } from '@/components/templates/ClientNavigation';

/**
 * バックグラウンドエフェクトと色調整機能
 */
export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
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
