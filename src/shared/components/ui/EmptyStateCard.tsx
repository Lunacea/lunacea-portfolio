import type { ReactNode } from 'react';

type EmptyStateCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export default function EmptyStateCard({ icon, title, description }: EmptyStateCardProps) {
  return (
    <div className="text-center py-20">
      <div className="relative inline-block">
        {/* 背景エフェクト */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-2xl scale-110"></div>

        <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-16 border border-border/50 shadow-[0_16px_64px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-center w-24 h-24 bg-card/50 backdrop-blur-sm border border-border/30 rounded-3xl mx-auto mb-8">
            {icon}
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-4">{title}</h2>

          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">{description}</p>

          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse animation-delay-200"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
