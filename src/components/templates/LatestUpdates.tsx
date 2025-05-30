'use client';

export const LatestUpdates = () => {
  const updates = [
    {
      title: 'ポートフォリオサイト公開',
      date: '2025-05-04',
      url: '/works/portfolio',
      description: 'Next.js 15とTailwind CSSで構築',
    },
    {
      title: 'BGM機能追加',
      date: '2025-05-29',
      url: '/about',
      description: 'オーディオビジュアライザー実装',
    },
  ];

  // 日付降順でソートし、最新2件のみ取得
  const sortedLatestUpdates = updates
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);

  return (
    <div className="fixed bottom-24 left-4 lg:bottom-32 lg:left-6 z-99 flex flex-col">
      <div className="max-w-xs">
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
                <div className="w-full h-px bg-border mt-3 lg:mt-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
