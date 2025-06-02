import { getTranslations } from 'next-intl/server';

type ILatestUpdatesProps = {
  locale: string;
};

export async function LatestUpdates({ locale }: ILatestUpdatesProps) {
  const t = await getTranslations({
    locale,
    namespace: 'LatestUpdates',
  });

  const updates = [
    {
      title: t('latest_updates_1'),
      date: '2025-05-04',
      url: '',
      description: t('latest_updates_1_description'),
    },
    {
      title: t('latest_updates_2'),
      date: '2025-05-31',
      url: '/blog',
      description: t('latest_updates_2_description'),
    },
  ];

  // 日付降順でソートし、最新2件のみ取得
  const sortedLatestUpdates = updates
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  return (
    <div className="fixed bottom-24 left-6 z-1 flex flex-col">
      <div className="max-w-xs backdrop-blur-[2px] bg-gradient-to-r from-background/8 to-transparent p-4 shadow-sm border-l border-border/10">
        <h3 className="text-xs font-heading font-semibold text-muted-foreground mb-3 lg:mb-4 tracking-wider">
          LATEST UPDATES
        </h3>
        <div className="space-y-3 lg:space-y-4">
          {sortedLatestUpdates.map((update, index) => (
            <div key={`${update.url}-${update.title}`}>
              <a
                href={update.url}
                className="block group"
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-theme-primary group-hover:text-theme-accent transition-colors leading-tight">
                    {update.title}
                  </h4>
                  <span className="text-xs text-muted-foreground ml-3 flex-shrink-0 font-mono">
                    {update.date}
                  </span>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed mb-2">
                  {update.description}
                </p>
              </a>
              {index < sortedLatestUpdates.length - 1 && (
                <div className="w-full h-px bg-border/10 mt-3 lg:mt-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
