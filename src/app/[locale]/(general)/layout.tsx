import BaseTemplate from '@/shared/components/layouts/BaseTemplate';
import NavigationLinks from '@/shared/components/layouts/NavigationLinks';
import AnalyticsTracker from '@/shared/components/analytics/AnalyticsTracker';

/**
 * バックグラウンドエフェクトと色調整機能
 */
export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <>
      {/* メインコンテンツ */}
      <div className="relative">
        <BaseTemplate leftNav={<NavigationLinks />}>
          <AnalyticsTracker />
          {props.children}
        </BaseTemplate>
      </div>
    </>
  );
}

