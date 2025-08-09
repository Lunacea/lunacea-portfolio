import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
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
import { BackToTop } from '@/components/BackToTop';
import { DraggableBusinessCard } from '@/components/DraggableBusinessCard';
import { ScrollHintContainer } from '@/components/ScrollHintContainer';
import { ScrollReveal } from '@/components/ScrollReveal';

type IProfileProps = {
  params: Promise<{ locale: string }>;
};

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade';

type SectionProps = {
  title: string;
  revealDirection?: RevealDirection;
  revealDelay?: number;
  children: ReactNode;
  className?: string;
};

function Section({
  title,
  revealDirection = 'up',
  revealDelay = 200,
  className,
  children,
}: SectionProps) {
  return (
    <ScrollReveal direction={revealDirection} delay={revealDelay}>
      <section className={className ?? 'mb-20'}>
        <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">{title}</h2>
        {children}
      </section>
    </ScrollReveal>
  );
}

type BorderedArticleProps = {
  title: string;
  subheader?: string;
  children: ReactNode;
};

function BorderedArticle({ title, subheader, children }: BorderedArticleProps) {
  return (
    <article className="border-l-2 border-accent pl-6">
      <h3 className="text-xl font-medium text-foreground mb-2">{title}</h3>
      {subheader ? <p className="text-sm text-muted-foreground mb-3">{subheader}</p> : null}
      {children}
    </article>
  );
}

type SkillItem = {
  label: string;
  icon: ReactElement;
};

type SkillCategoryProps = {
  title: string;
  items: ReadonlyArray<SkillItem>;
};

function SkillCategory({ title, items }: SkillCategoryProps) {
  return (
    <div>
      <h3 className="text-lg font-medium text-foreground mb-6">{title}</h3>
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
            {item.icon}
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function generateMetadata(props: IProfileProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Profile',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function Profile(props: IProfileProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Profile' });

  const certifications = [
    {
      nameKey: 'certification_ap_name',
      issuerKey: 'certification_ap_issuer',
      year: '2022',
    },
    {
      nameKey: 'certification_fe_name',
      issuerKey: 'certification_fe_issuer',
      year: '2021',
    },
  ];

  const coreStrengths = [
    {
      titleKey: 'core_strength_user_centric_title',
      descKey: 'core_strength_user_centric_description',
    },
    {
      titleKey: 'core_strength_learning_title',
      descKey: 'core_strength_learning_description',
    },
    {
      titleKey: 'core_strength_teamwork_title',
      descKey: 'core_strength_teamwork_description',
    },
  ];

  const educations = [
    {
      titleKey: 'education_master_course',
      detailsKey: 'education_master_details',
      periodKey: 'education_master_period',
    },
    {
      titleKey: 'education_bachelor_ipu',
      detailsKey: 'education_bachelor_ipu_details',
      periodKey: 'education_bachelor_ipu_period',
    },
    {
      titleKey: 'education_bachelor_tohoku',
      detailsKey: 'education_bachelor_tohoku_details',
      periodKey: 'education_bachelor_tohoku_period',
    },
  ] as const;

  const skillCategories = [
    {
      title: 'Programming Languages',
      delay: 100,
      items: [
        { label: 'TypeScript', icon: <SiTypescript className="w-5 h-5 text-[#3178C6]" /> },
        { label: 'JavaScript', icon: <SiJavascript className="w-5 h-5 text-[#F7DF1E]" /> },
        { label: 'Python', icon: <SiPython className="w-5 h-5 text-[#3776AB]" /> },
        { label: 'C#', icon: <SiSharp className="w-5 h-5 text-[#239120]" /> },
        { label: 'HTML', icon: <SiHtml5 className="w-5 h-5 text-[#E34F26]" /> },
        { label: 'CSS', icon: <SiCss3 className="w-5 h-5 text-[#1572B6]" /> },
      ],
    },
    {
      title: 'Frontend',
      delay: 200,
      items: [
        { label: 'React', icon: <SiReact className="w-5 h-5 text-[#61DAFB]" /> },
        { label: 'Next.js', icon: <SiNextdotjs className="w-5 h-5 text-foreground" /> },
        { label: 'Svelte/SvelteKit', icon: <SiSvelte className="w-5 h-5 text-[#FF3E00]" /> },
        { label: 'Tailwind CSS', icon: <SiTailwindcss className="w-5 h-5 text-[#06B6D4]" /> },
      ],
    },
    {
      title: 'Tools & Backend',
      delay: 300,
      items: [
        { label: 'Git', icon: <SiGit className="w-5 h-5 text-[#F05032]" /> },
        { label: 'GitHub', icon: <SiGithub className="w-5 h-5 text-foreground" /> },
        { label: 'Docker', icon: <SiDocker className="w-5 h-5 text-[#2496ED]" /> },
        { label: 'Node.js', icon: <SiNodedotjs className="w-5 h-5 text-[#339933]" /> },
        { label: 'PostgreSQL', icon: <SiPostgresql className="w-5 h-5 text-[#4169E1]" /> },
      ],
    },
  ] as const;

  return (
    <div className="min-h-screen">
      <ScrollHintContainer className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Draggable Business Card */}
        <ScrollReveal direction="fade" delay={100} className="relative z-1">
          <DraggableBusinessCard />
        </ScrollReveal>
        <div className="overflow-x-clip">
          {/* Mission Statement */}
          <Section title={t('mission_title')} revealDirection="fade" revealDelay={100}>
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t('mission_statement_detail_1')}
                <br />
                {t('mission_statement_detail_2')}
              </p>
            </div>
          </Section>

          {/* Experience */}
          <Section title={t('experience_achievements_title')} revealDirection="up" revealDelay={200}>
            <div className="space-y-12">
              {/* Research */}
              <ScrollReveal direction="left" delay={300}>
                <BorderedArticle title={t('research_section_title')} subheader={t('research_affiliation')}>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('research_description_1')}
                    <br />
                    {t('research_description_2')}
                  </p>
                </BorderedArticle>
              </ScrollReveal>

              {/* Professional Experience */}
              <ScrollReveal direction="left" delay={100}>
                <BorderedArticle title={t('professional_dev_section_title')} subheader={t('professional_dev_affiliation')}>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground">{t('vr_app_dev_title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('vr_app_dev_description')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{t('notification_app_dev_title')}</h4>
                      <p className="text-sm text-muted-foreground">{t('notification_app_dev_description')}</p>
                    </div>
                  </div>
                </BorderedArticle>
              </ScrollReveal>

              {/* Hackathon */}
              <ScrollReveal direction="left" delay={100}>
                <BorderedArticle title={t('hackathon_section_title')} subheader={t('hackathon_award_subheader')}>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">{t('hackathon_project_name')}</h4>
                    <p className="text-muted-foreground">
                      {t('hackathon_project_description_1')}
                      <br />
                      {t('hackathon_project_description_2')}
                    </p>
                  </div>
                </BorderedArticle>
              </ScrollReveal>

              {/* Leadership */}
              <ScrollReveal direction="left" delay={100}>
                <BorderedArticle title={t('leadership_section_title')} subheader={t('leadership_role_and_affiliation')}>
                  <p className="text-muted-foreground">{t('leadership_description')}</p>
                </BorderedArticle>
              </ScrollReveal>
            </div>
          </Section>

          {/* Technical Skills */}
          <Section title={t('tech_stack_title')} revealDirection="up" revealDelay={200}>
            <div className="grid md:grid-cols-3 gap-8">
              {skillCategories.map(category => (
                <ScrollReveal key={category.title} direction="up" delay={category.delay}>
                  <SkillCategory title={category.title} items={category.items} />
                </ScrollReveal>
              ))}
            </div>
          </Section>

          {/* Qualifications & Education */}
          <Section title={t('qualifications_education_title')} revealDirection="up" revealDelay={200}>
            <div className="grid md:grid-cols-2 gap-12">
              {/* Education */}
              <ScrollReveal direction="right" delay={200}>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-6">{t('education_section_title')}</h3>
                  <div className="space-y-6">
                    {educations.map(edu => (
                      <div key={edu.titleKey} className="border-l-2 border-accent pl-4">
                        <h4 className="font-medium text-foreground">{t(edu.titleKey)}</h4>
                        <p className="text-sm text-muted-foreground">{t(edu.detailsKey)}</p>
                        <p className="text-xs text-muted-foreground/70">{t(edu.periodKey)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Certifications */}
              <ScrollReveal direction="right" delay={200}>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-6">{t('certifications_section_title')}</h3>
                  <div className="space-y-4">
                    {certifications.map(cert => (
                      <div key={cert.nameKey} className="pl-4 border-l-2 border-accent">
                        <h4 className="font-medium text-foreground">{t(cert.nameKey)}</h4>
                        <p className="text-sm text-muted-foreground">{t(cert.issuerKey)}</p>
                        <p className="text-xs text-muted-foreground/70">{cert.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </Section>

          {/* Core Strengths */}
          <Section title={t('core_strengths_title')} revealDirection="up" revealDelay={100}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {coreStrengths.map((strength, index) => (
                <ScrollReveal key={strength.titleKey} direction="fade" delay={index * 100 + 100}>
                  <h3 className="text-center font-medium text-foreground mb-3">{t(strength.titleKey)}</h3>
                  <p className="text-sm text-left text-muted-foreground leading-relaxed">{t(strength.descKey)}</p>
                </ScrollReveal>
              ))}
            </div>
          </Section>

          {/* Back to Top */}
          <BackToTop />
        </div>
      </ScrollHintContainer>
    </div>
  );
}
