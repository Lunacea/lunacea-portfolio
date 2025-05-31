import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  SiCss3,
  SiDocker,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPython,
  SiReact,
  SiSharp,
  SiSvelte,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';
import { DraggableBusinessCard } from '@/components/DraggableBusinessCard';
import { ScrollReveal } from '@/components/ScrollReveal';

type IAboutProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata(props: IAboutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const _t = await getTranslations({
    locale,
    namespace: 'About',
  });

  return {
    title: _t('meta_title'),
    description: _t('meta_description'),
  };
}

export default async function About(props: IAboutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Draggable Business Card */}
        <DraggableBusinessCard locale={locale} />

        {/* Mission Statement */}
        <ScrollReveal direction="fade" delay={100}>
          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Mission</h2>
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                「人々が気持ちよく表現し合える環境に貢献できるプロダクトづくり」を目指して、
                <br />
                ユーザーファーストを重視したプロダクト開発を行っています。
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* Experience */}
        <ScrollReveal direction="up" delay={200}>
          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">Experience & Achievements</h2>

            <div className="space-y-12">
              {/* Research */}
              <ScrollReveal direction="left" delay={300}>
                <article className="border-l-2 border-accent pl-6">
                  <h3 className="text-xl font-medium text-foreground mb-2">User Interface Research</h3>
                  <p className="text-sm text-muted-foreground mb-3">岩手県立大学 ソフトウェア情報学研究科</p>
                  <p className="text-muted-foreground leading-relaxed">
                    オンラインカスタマーレビューのフィードバック可視化システムを開発中。
                    <br />
                    ユーザー中心設計を意識した研究開発を進めています。
                  </p>
                </article>
              </ScrollReveal>

              {/* Professional Experience */}
              <ScrollReveal direction="left" delay={100}>
                <article className="border-l-2 border-accent pl-6">
                  <h3 className="text-xl font-medium text-foreground mb-2">Professional Development</h3>
                  <p className="text-sm text-muted-foreground mb-4">アルバイト・インターンシップ経験</p>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground">VR音声メモシステム開発</h4>
                      <p className="text-sm text-muted-foreground">C#、Whisper API、Excel出力を活用したデスクトップアプリケーション開発</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">通知システムWebアプリ開発</h4>
                      <p className="text-sm text-muted-foreground">Next.js + TypeScript によるフルスタック開発、OneSignal活用</p>
                    </div>
                  </div>
                </article>
              </ScrollReveal>

              {/* Hackathon */}
              <ScrollReveal direction="left" delay={100}>
                <article className="border-l-2 border-accent pl-6">
                  <h3 className="text-xl font-medium text-foreground mb-2">Hackathon Achievement</h3>
                  <p className="text-sm text-muted-foreground mb-3">受賞実績</p>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Takizawa Hackathon Ver.7</h4>
                    <p className="text-muted-foreground">
                      農家さんのプロフィールQR生成アプリ「TunaAgri」をSvelteで開発。
                      <br />
                      導入の容易さとコミュニティ活性化への解決策が評価され受賞。
                    </p>
                  </div>
                </article>
              </ScrollReveal>

              {/* Leadership */}
              <ScrollReveal direction="left" delay={100}>
                <article className="border-l-2 border-accent pl-6">
                  <h3 className="text-xl font-medium text-foreground mb-2">Leadership Experience</h3>
                  <p className="text-sm text-muted-foreground mb-3">東北大学学友会吹奏楽部 部長</p>
                  <p className="text-muted-foreground">
                    約200名規模の組織運営、サークル合同演奏会の主導、規約改善等を実施。
                  </p>
                </article>
              </ScrollReveal>
            </div>
          </section>
        </ScrollReveal>

        {/* Technical Skills */}
        <ScrollReveal direction="up" delay={200}>
          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">Technical Skills</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Programming Languages */}
              <ScrollReveal direction="up" delay={100}>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-6">Programming Languages</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiTypescript className="w-5 h-5 text-[#3178C6]" />
                      TypeScript
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiJavascript className="w-5 h-5 text-[#F7DF1E]" />
                      JavaScript
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiPython className="w-5 h-5 text-[#3776AB]" />
                      Python
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiSharp className="w-5 h-5 text-[#239120]" />
                      C#
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiHtml5 className="w-5 h-5 text-[#E34F26]" />
                      HTML
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiCss3 className="w-5 h-5 text-[#1572B6]" />
                      CSS
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              {/* Frontend */}
              <ScrollReveal direction="up" delay={200}>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-6">Frontend</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiReact className="w-5 h-5 text-[#61DAFB]" />
                      React
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiNextdotjs className="w-5 h-5 text-foreground" />
                      Next.js
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiSvelte className="w-5 h-5 text-[#FF3E00]" />
                      Svelte/SvelteKit
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiTailwindcss className="w-5 h-5 text-[#06B6D4]" />
                      Tailwind CSS
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              {/* Tools & Backend */}
              <ScrollReveal direction="up" delay={300}>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-6">Tools & Backend</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiGit className="w-5 h-5 text-[#F05032]" />
                      Git
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiGithub className="w-5 h-5 text-foreground" />
                      GitHub
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiDocker className="w-5 h-5 text-[#2496ED]" />
                      Docker
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiNodedotjs className="w-5 h-5 text-[#339933]" />
                      Node.js
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <SiPostgresql className="w-5 h-5 text-[#4169E1]" />
                      PostgreSQL
                    </li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </ScrollReveal>

        {/* Qualifications & Education */}
        <ScrollReveal direction="up" delay={200}>
          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">Qualifications & Education</h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Education */}
              <ScrollReveal direction="right" delay={200}>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-6">Education</h3>
                  <div className="space-y-6">
                    <div className="border-l-2 border-accent pl-4">
                      <h4 className="font-medium text-foreground">岩手県立大学大学院</h4>
                      <p className="text-sm text-muted-foreground">ソフトウェア情報学研究科 博士前期課程 (在学中)</p>
                      <p className="text-xs text-muted-foreground/70">2025年4月 - 現在</p>
                    </div>
                    <div className="border-l-2 border-accent pl-4">
                      <h4 className="font-medium text-foreground">岩手県立大学</h4>
                      <p className="text-sm text-muted-foreground">ソフトウェア情報学部 卒業</p>
                      <p className="text-xs text-muted-foreground/70">2023年4月 - 2025年3月</p>
                    </div>
                    <div className="border-l-2 border-accent pl-4">
                      <h4 className="font-medium text-foreground">東北大学</h4>
                      <p className="text-sm text-muted-foreground">工学部 材料科学総合学科 転学</p>
                      <p className="text-xs text-muted-foreground/70">2016年4月 - 2023年3月</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Certifications */}
              <ScrollReveal direction="left" delay={200}>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-6">Certifications</h3>
                  <div className="space-y-4">
                    {[
                      {
                        name: '応用情報技術者試験',
                        issuer: 'IPA 独立行政法人 情報処理推進機構',
                        year: '2022',
                      },
                      {
                        name: '基本情報技術者試験',
                        issuer: 'IPA 独立行政法人 情報処理推進機構',
                        year: '2021',
                      },
                    ].map(cert => (
                      <div key={cert.name} className="pl-4 border-l-2 border-accent">
                        <h4 className="font-medium text-foreground">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        <p className="text-xs text-muted-foreground/70">{cert.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </ScrollReveal>

        {/* Core Strengths */}
        <ScrollReveal direction="up" delay={100}>
          <section className="mb-20">
            <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">Core Strengths</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[
                {
                  title: 'ユーザー中心設計',
                  desc: '利用者の視点に立ち、直感的で使いやすいインターフェースの実現に注力。',
                },
                {
                  title: '継続的学習意欲',
                  desc: '新しい技術や知識を積極的に習得し、常に自己のスキルアップを図る。',
                },
                {
                  title: 'チームワーク',
                  desc: '多様なメンバーと協調し、共通の目標達成に向けて貢献。',
                },
              ].map((strength, index) => (
                <ScrollReveal key={strength.title} direction="fade" delay={index * 100 + 100}>
                  <h3 className="text-center font-medium text-foreground mb-3">{strength.title}</h3>
                  <p className="text-sm text-left text-muted-foreground leading-relaxed">{strength.desc}</p>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Footer */}
        {/* <ScrollReveal direction="fade" delay={100}>
          <footer className="text-center pt-8 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              常に成長し続けています
            </p>
          </footer>
        </ScrollReveal> */}
      </div>
    </div>
  );
}
