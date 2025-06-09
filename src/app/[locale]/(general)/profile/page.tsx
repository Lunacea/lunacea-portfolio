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

type IProfileProps = {
  params: Promise<{ locale: string }>;
};

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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl relative">
        {/* Draggable Business Card */}
        <ScrollReveal direction="fade" delay={100} className="relative z-1">
          <DraggableBusinessCard />
        </ScrollReveal>
        <div className="overflow-x-clip">
          {/* Mission Statement */}
          <ScrollReveal direction="fade" delay={100}>
            <section className="mb-20">
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">{t('mission_title')}</h2>
              <div className="text-center max-w-3xl mx-auto">
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {t('mission_statement_detail_1')}
                  <br />
                  {t('mission_statement_detail_2')}
                </p>
              </div>
            </section>
          </ScrollReveal>

          {/* Experience */}
          <ScrollReveal direction="up" delay={200}>
            <section className="mb-20">
              <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">
                {t('experience_achievements_title')}
              </h2>

              <div className="space-y-12">
                {/* Research */}
                <ScrollReveal direction="left" delay={300}>
                  <article className="border-l-2 border-accent pl-6">
                    <h3 className="text-xl font-medium text-foreground mb-2">{t('research_section_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('research_affiliation')}</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('research_description_1')}
                      <br />
                      {t('research_description_2')}
                    </p>
                  </article>
                </ScrollReveal>

                {/* Professional Experience */}
                <ScrollReveal direction="left" delay={100}>
                  <article className="border-l-2 border-accent pl-6">
                    <h3 className="text-xl font-medium text-foreground mb-2">{t('professional_dev_section_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t('professional_dev_affiliation')}</p>
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
                  </article>
                </ScrollReveal>

                {/* Hackathon */}
                <ScrollReveal direction="left" delay={100}>
                  <article className="border-l-2 border-accent pl-6">
                    <h3 className="text-xl font-medium text-foreground mb-2">{t('hackathon_section_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('hackathon_award_subheader')}</p>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">{t('hackathon_project_name')}</h4>
                      <p className="text-muted-foreground">
                        {t('hackathon_project_description_1')}
                        <br />
                        {t('hackathon_project_description_2')}
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Leadership */}
                <ScrollReveal direction="left" delay={100}>
                  <article className="border-l-2 border-accent pl-6">
                    <h3 className="text-xl font-medium text-foreground mb-2">{t('leadership_section_title')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t('leadership_role_and_affiliation')}</p>
                    <p className="text-muted-foreground">{t('leadership_description')}</p>
                  </article>
                </ScrollReveal>
              </div>
            </section>
          </ScrollReveal>

          {/* Technical Skills */}
          <ScrollReveal direction="up" delay={200}>
            <section className="mb-20">
              <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">{t('tech_stack_title')}</h2>

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
              <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">
                {t('qualifications_education_title')}
              </h2>

              <div className="grid md:grid-cols-2 gap-12">
                {/* Education */}
                <ScrollReveal direction="right" delay={200}>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-6">{t('education_section_title')}</h3>
                    <div className="space-y-6">
                      <div className="border-l-2 border-accent pl-4">
                        <h4 className="font-medium text-foreground">{t('education_master_course')}</h4>
                        <p className="text-sm text-muted-foreground">{t('education_master_details')}</p>
                        <p className="text-xs text-muted-foreground/70">{t('education_master_period')}</p>
                      </div>
                      <div className="border-l-2 border-accent pl-4">
                        <h4 className="font-medium text-foreground">{t('education_bachelor_ipu')}</h4>
                        <p className="text-sm text-muted-foreground">{t('education_bachelor_ipu_details')}</p>
                        <p className="text-xs text-muted-foreground/70">{t('education_bachelor_ipu_period')}</p>
                      </div>
                      <div className="border-l-2 border-accent pl-4">
                        <h4 className="font-medium text-foreground">{t('education_bachelor_tohoku')}</h4>
                        <p className="text-sm text-muted-foreground">{t('education_bachelor_tohoku_details')}</p>
                        <p className="text-xs text-muted-foreground/70">{t('education_bachelor_tohoku_period')}</p>
                      </div>
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
            </section>
          </ScrollReveal>

          {/* Core Strengths */}
          <ScrollReveal direction="up" delay={100}>
            <section className="mb-20">
              <h2 className="text-2xl font-semibold text-foreground mb-12 text-center">{t('core_strengths_title')}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {coreStrengths.map((strength, index) => (
                  <ScrollReveal key={strength.titleKey} direction="fade" delay={index * 100 + 100}>
                    <h3 className="text-center font-medium text-foreground mb-3">{t(strength.titleKey)}</h3>
                    <p className="text-sm text-left text-muted-foreground leading-relaxed">{t(strength.descKey)}</p>
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
    </div>
  );
}
