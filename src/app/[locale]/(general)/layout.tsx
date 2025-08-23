import BaseTemplate from '@/shared/components/layouts/BaseTemplate';

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
        <BaseTemplate>
          {props.children}
        </BaseTemplate>
      </div>
    </>
  );
}
