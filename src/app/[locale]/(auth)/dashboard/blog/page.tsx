import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { FaEdit, FaEye, FaSearch, FaTag, FaComment, FaChartBar } from 'react-icons/fa';
import Icon from '@/shared/components/ui/Icon';
import ScrollReveal from '@/shared/components/ui/ScrollReveal';
import BlogStats from '@/features/blog/admin/components/BlogStats';

type BlogEditorPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function BlogEditorPage({ params }: BlogEditorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* ページヘッダー */}
        <header className="text-center mb-16">
          <ScrollReveal direction="fade" delay={100}>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              ブログエディター
            </h1>
            <p className="text-lg text-muted-foreground">
              記事の作成・編集・管理を行います
            </p>
          </ScrollReveal>
        </header>

        {/* 新規記事作成 */}
        <ScrollReveal direction="fade" delay={150}>
          <Link href="/dashboard/blog/create">
            <article className="group relative overflow-hidden rounded-3xl
              bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm
              border border-primary/20
              shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
              hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
              dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
              dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
              transition-all duration-300 p-8 mb-12"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5
                opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              
              <div className="relative z-1 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Icon icon={<FaEdit />} className="text-primary text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      新規記事作成
                    </h2>
                    <p className="text-muted-foreground">
                      新しいブログ記事を作成します
                    </p>
                  </div>
                </div>
                <div className="text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                  記事を作成 →
                </div>
              </div>
            </article>
          </Link>
        </ScrollReveal>

        {/* 記事管理カード */}
        <ScrollReveal direction="fade" delay={200}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-12">
            {/* 下書き一覧 */}
            <Link href="/dashboard/blog/drafts">
              <article className="group relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
                dark:bg-card dark:from-card dark:to-card
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
                dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
                dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
                transition-all duration-300 p-6 h-48 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  dark:from-primary/2 dark:via-transparent dark:to-accent/2 dark:opacity-0 dark:group-hover:opacity-50"
                />
                
                <div className="relative z-1 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon icon={<FaEdit />} className="text-primary text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      下書き一覧
                    </h3>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      保存された下書き記事を管理します
                    </p>
                  </div>
                  
                  <div className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                    下書きを確認 →
                  </div>
                </div>
              </article>
            </Link>

            {/* 公開済み記事 */}
            <Link href="/dashboard/blog/published">
              <article className="group relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
                dark:bg-card dark:from-card dark:to-card
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
                dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
                dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
                transition-all duration-300 p-6 h-48 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  dark:from-primary/2 dark:via-transparent dark:to-accent/2 dark:opacity-0 dark:group-hover:opacity-50"
                />
                
                <div className="relative z-1 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon icon={<FaEye />} className="text-primary text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      公開済み記事
                    </h3>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      公開済みの記事を編集・管理します
                    </p>
                  </div>
                  
                  <div className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                    記事を管理 →
                  </div>
                </div>
              </article>
            </Link>

            {/* 記事検索 */}
            <Link href="/dashboard/blog/search">
              <article className="group relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
                dark:bg-card dark:from-card dark:to-card
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
                dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
                dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
                transition-all duration-300 p-6 h-48 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  dark:from-primary/2 dark:via-transparent dark:to-accent/2 dark:opacity-0 dark:group-hover:opacity-50"
                />
                
                <div className="relative z-1 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon icon={<FaSearch />} className="text-primary text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      記事検索
                    </h3>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      タイトル、内容、タグで記事を検索
                    </p>
                  </div>
                  
                  <div className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                    記事を検索 →
                  </div>
                </div>
              </article>
            </Link>

            {/* カテゴリ管理 */}
            <Link href="/dashboard/blog/categories">
              <article className="group relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
                dark:bg-card dark:from-card dark:to-card
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
                dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
                dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
                transition-all duration-300 p-6 h-48 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  dark:from-primary/2 dark:via-transparent dark:to-accent/2 dark:opacity-0 dark:group-hover:opacity-50"
                />
                
                <div className="relative z-1 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon icon={<FaTag />} className="text-primary text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      カテゴリ管理
                    </h3>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      記事のタグをカテゴリとして管理
                    </p>
                  </div>
                  
                  <div className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                    カテゴリ管理 →
                  </div>
                </div>
              </article>
            </Link>

            {/* コメント管理 */}
            <Link href="/dashboard/blog/comments">
              <article className="group relative overflow-hidden rounded-3xl
                bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
                dark:bg-card dark:from-card dark:to-card
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
                dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
                dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
                transition-all duration-300 p-6 h-48 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  dark:from-primary/2 dark:via-transparent dark:to-accent/2 dark:opacity-0 dark:group-hover:opacity-50"
                />
                
                <div className="relative z-1 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Icon icon={<FaComment />} className="text-primary text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      コメント管理
                    </h3>
                  </div>
                  
                  <div className="flex-1 mb-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      記事のコメントを管理
                    </p>
                  </div>
                  
                  <div className="text-sm text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                    コメント管理 →
                  </div>
                </div>
              </article>
            </Link>
          </div>
        </ScrollReveal>

        {/* 統計情報 */}
        <ScrollReveal direction="fade" delay={250}>
          <article className="relative overflow-hidden rounded-3xl
            bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
            dark:bg-card dark:from-card dark:to-card
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
            dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
            transition-all duration-300 p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Icon icon={<FaChartBar />} className="text-primary text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">統計情報</h2>
                <p className="text-muted-foreground">ブログの投稿状況とパフォーマンス</p>
              </div>
            </div>
            <BlogStats />
          </article>
        </ScrollReveal>
      </div>
    </div>
  );
}
