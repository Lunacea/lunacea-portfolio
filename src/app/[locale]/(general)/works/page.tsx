import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ScrollReveal } from '@/components/ScrollReveal';

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
        <ScrollReveal direction="fade" delay={100}>
          <header className="text-center mb-20">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              WORKS
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('preparing_title')}
              <br />
              {t('meta_description')}
            </p>
          </header>
        </ScrollReveal>

        {/* プロジェクト準備中エリア */}
        <ScrollReveal direction="up" delay={200}>
          <section className="mb-20">
            {/* 将来のプロジェクトグリッド用スペース */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

              <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-12 md:p-16 border border-border/30 shadow-xl">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-md mx-auto">
                </p>
              </div>
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-12 md:p-16 border border-border/30 shadow-xl">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-md mx-auto">
                </p>
              </div>

            </div>
          </section>
        </ScrollReveal>

        {/* フッター */}
        {/* <ScrollReveal direction="fade" delay={100}>
          <footer className="text-center pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              {t('footer_message')}
            </p>
          </footer>
        </ScrollReveal> */}
      </div>
    </div>
  );
};
