import { getTranslations, setRequestLocale } from 'next-intl/server';
import ClientSignUp from '@/shared/components/auth/ClientSignUp';
import { getI18nPath } from '@/shared/utils/Helpers';

type ISignUpPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISignUpPageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignUp',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignUpPage(props: ISignUpPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <ClientSignUp path={getI18nPath('/sign-up', locale)} />;
};
