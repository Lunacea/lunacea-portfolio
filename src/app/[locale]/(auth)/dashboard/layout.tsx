import { setRequestLocale } from 'next-intl/server';
import BaseTemplate from '@/shared/components/layouts/BaseTemplate';
import NavigationLinks from '@/shared/components/layouts/dashboard/NavigationLinks';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <BaseTemplate
      leftNav={<NavigationLinks />}
    >
      {props.children}
    </BaseTemplate>
  );
}
