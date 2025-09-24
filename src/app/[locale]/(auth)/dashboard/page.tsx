import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { auth } from '@/shared/libs/auth-server';
import { redirect } from 'next/navigation';
import ScrollReveal from '@/shared/components/ui/ScrollReveal';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
  };
}

export default async function Dashboard(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  
  // サーバーサイドで認証状態を確認
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <ScrollReveal direction="fade" delay={100}>
          <DashboardClient />
        </ScrollReveal>
      </div>
    </div>
  );
}
