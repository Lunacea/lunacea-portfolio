import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FaCode, FaRocket } from 'react-icons/fa';
// import { ScrollReveal } from '@/components/ScrollReveal';

type IWorksProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata(props: IWorksProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Works',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Works(props: IWorksProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Works' });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* ページヘッダー */}
        {/* <ScrollReveal direction="fade" delay={100}> */}
        <header className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            WORKS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('meta_description')}
          </p>
        </header>
        {/* </ScrollReveal> */}

        {/* プロジェクト準備中エリア */}
        {/* <ScrollReveal direction="up" delay={200}> */}
        <section className="mb-20">
          {/* 将来のプロジェクトグリッド用スペース */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* プロジェクトが追加されるまで空 */}
          </div>

          {/* メイン準備中表示 */}
          <div className="text-center py-20">
            <div className="relative inline-block">
              {/* 背景エフェクト */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-2xl scale-110"></div>

              <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-12 md:p-16 border border-border/30 shadow-xl">
                <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-card/50 backdrop-blur-sm border border-border/30 rounded-3xl mx-auto mb-8">
                  <FaCode className="text-foreground text-3xl md:text-4xl" />
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {t('preparing_title')}
                </h2>

                <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-md mx-auto">
                  {t('preparing_description')}
                </p>

                {/* ステータス表示 */}
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <FaRocket className="text-sm" />
                  <span className="font-medium text-sm">{t('status_developing')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* </ScrollReveal> */}

        {/* フッター */}
        {/* <ScrollReveal direction="fade" delay={100}> */}
        <footer className="text-center pt-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground">
            {t('footer_message')}
          </p>
        </footer>
        {/* </ScrollReveal> */}
      </div>
    </div>
  );
};
