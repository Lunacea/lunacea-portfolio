import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { getCurrentUser } from '@/shared/libs/auth-server';
import { redirect } from 'next/navigation';
import ScrollReveal from '@/shared/components/ui/ScrollReveal';

// Cookie を使用するため動的レンダリングが必要
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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
  
  // サーバーサイドでユーザー情報を取得（middlewareで認証済み）
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <ScrollReveal direction="fade" delay={100}>
          <DashboardClient initialUser={user} />
        </ScrollReveal>
      </div>
    </div>
  );
}
