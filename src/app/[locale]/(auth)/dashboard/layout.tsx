import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import BaseTemplate from '@/shared/components/layouts/BaseTemplate';
import LocaleSwitcher from '@/shared/components/layouts/LocaleSwitcher';
import { SupabaseSignOutButton } from '@/components/auth/SupabaseSignOutButton';
import { FaHome, FaEdit, FaUser } from 'react-icons/fa';
import Icon from '@/shared/components/ui/Icon';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
    <BaseTemplate
      leftNav={(
        <>
          <li>
            <Link
              href="/dashboard/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-theme-secondary hover:text-theme-primary hover:bg-card/50 transition-all duration-300 backdrop-blur-sm"
            >
              <Icon icon={<FaHome />} className="text-primary" />
              {t('dashboard_link')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/blog/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-theme-secondary hover:text-theme-primary hover:bg-card/50 transition-all duration-300 backdrop-blur-sm"
            >
              <Icon icon={<FaEdit />} className="text-primary" />
              {t('blog_management')}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/user-profile/"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-theme-secondary hover:text-theme-primary hover:bg-card/50 transition-all duration-300 backdrop-blur-sm"
            >
              <Icon icon={<FaUser />} className="text-primary" />
              {t('user_profile_link')}
            </Link>
          </li>
        </>
      )}
      rightNav={(
        <>
          <li>
            <SupabaseSignOutButton>
              <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-theme-secondary hover:text-theme-primary hover:bg-card/50 transition-all duration-300 backdrop-blur-sm" type="button">
                {t('sign_out')}
              </button>
            </SupabaseSignOutButton>
          </li>

          <li>
            <LocaleSwitcher />
          </li>
        </>
      )}
    >
      {props.children}
    </BaseTemplate>
  );
}
