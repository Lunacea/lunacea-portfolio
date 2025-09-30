import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { auth } from '@/shared/libs/auth-server';
import { SupabaseSignIn } from '@/components/auth/SupabaseSignIn';
import { Metadata } from 'next';

type ISignInPageProps = {
  params: Promise<{ locale: string }>;
};

// cookies を使用するため動的レンダリングが必要
export const dynamic = 'force-dynamic';

export async function generateMetadata(props: ISignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignInPage(props: ISignInPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // 既にログイン済みならサーバーで即リダイレクト
  const { userId } = await auth();
  if (userId) {
    redirect(`/${locale}/dashboard`);
  }

  return <SupabaseSignIn />;
};
