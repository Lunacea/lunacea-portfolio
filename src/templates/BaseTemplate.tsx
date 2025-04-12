import SplitText from '@/components/ui/SplitText';
import { AppConfig } from '@/utils/AppConfig';
import { useTranslations } from 'next-intl';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <>
      <div className="w-full px-4 text-gray-200 antialiased">
        <div className="mx-auto max-w-screen-md">
          <header className="mb-4">
            <div className="py-8">
              <h1 className="text-2xl font-bold">
                <SplitText text={AppConfig.name} className="" />
              </h1>
              <h2 className="text-lg ">{t('description')}</h2>
            </div>

            <div className="flex justify-between">
              <nav>
                <ul className="flex flex-wrap gap-x-5 text-xl">
                  {props.leftNav}
                </ul>
              </nav>

              <nav>
                <ul className="flex flex-wrap gap-x-5 text-xl">
                  {props.rightNav}
                </ul>
              </nav>
            </div>
          </header>

          <main>{props.children}</main>
        </div>
      </div>
    </>
  );
};
