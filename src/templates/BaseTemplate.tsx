import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { AppConfig } from '@/utils/AppConfig';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <>
      <div className="w-full px-4 text-gray-200 antialiased min-h-screen bg-gradient-to-tr from-[#191970] to-[#00ced1]">
        <div className="mx-auto max-w-screen-lg">
          <header className="mb-4">
            <div className="py-8">
              <Link href="/">
                <h1 className="text-4xl font-bold">
                  {AppConfig.name}
                </h1>
                <h2 className="text-2lg ">{t('description')}</h2>
              </Link>
            </div>

            <div className="flex justify-between">
              <nav>
                {props.leftNav}
              </nav>

              <nav>
                {props.rightNav}
                <LocaleSwitcher />
              </nav>
            </div>
          </header>

          <main>{props.children}</main>
        </div>
      </div>
    </>
  );
};
