'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import {
  SiAdobe,
  SiAmazon,
  SiChartdotjs,
  SiCloudflare,
  SiCss3,
  SiDocker,
  SiDrizzle,
  SiEslint,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiFramer,
  SiGit,
  SiGithub,
  SiHono,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPrettier,
  SiPython,
  SiReact,
  SiRedis,
  SiSocketdotio,
  SiStripe,
  SiSvelte,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
  SiWebpack,
} from 'react-icons/si';
import ScrollReveal from '@/shared/components/ui/ScrollReveal';

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  url?: string;
  github?: string;
};

type ProjectCardProps = {
  project: Project;
  index: number;
};

const techIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Svelte': SiSvelte,
  'SvelteKit': SiSvelte,
  'Drizzlekit': SiDrizzle,
  'Drizzle': SiDrizzle,
  'Hono.js': SiHono,
  'Next.js 15': SiNextdotjs,
  'Next.js': SiNextdotjs,
  'React': SiReact,
  'TypeScript': SiTypescript,
  'Tailwind CSS': SiTailwindcss,
  'Framer Motion': SiFramer,
  'Node.js': SiNodedotjs,
  'MongoDB': SiMongodb,
  'Express': SiExpress,
  'JavaScript': SiJavascript,
  'HTML5': SiHtml5,
  'CSS3': SiCss3,
  'GitHub': SiGithub,
  'Vercel': SiVercel,
  'Cloudflare Pages': SiCloudflare,
  'Firebase': SiFirebase,
  'Supabase': SiSupabase,
  'Python': SiPython,
  'Docker': SiDocker,
  'PostgreSQL': SiPostgresql,
  'Redis': SiRedis,
  'AWS': SiAmazon,
  'Git': SiGit,
  'Vite': SiVite,
  'Webpack': SiWebpack,
  'ESLint': SiEslint,
  'Prettier': SiPrettier,
  'Figma': SiFigma,
  'Adobe': SiAdobe,
  'Chart.js': SiChartdotjs,
  'next-intl': SiNextdotjs,
  'PWA': SiReact,
  'Socket.io': SiSocketdotio,
  'Stripe': SiStripe,
  'WebAudio API': SiReact,
};

function ProjectImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground/80 font-light">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      onError={() => setImageError(true)}
      priority
    />
  );
}

function ProjectNumber({ number }: { number: number }) {
  return (
    <div className="absolute top-[-10px] left-[-10px] lg:top-[-20px] lg:left-[-20px] z-20
      text-primary dark:text-primary font-handwriting rotate-[-10deg]"
    >
      <span
        className="text-3xl md:text-4xl lg:text-5xl font-bold
        drop-shadow-lg dark:drop-shadow-md
        [text-shadow:_0_0_8px_rgba(255,255,255,0.8),_0_0_16px_rgba(255,255,255,0.6)]
        dark:[text-shadow:_0_0_8px_rgba(0,0,0,0.8),_0_0_16px_rgba(0,0,0,0.6)]"
      >
        {
          `#${String(number).padStart(3, '0')}`
        }
      </span>
    </div>
  );
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <div className="flex-shrink-0 w-full h-auto flex items-center justify-center py-4 md:py-6 lg:py-8 px-3 md:px-4 lg:px-8">
      <div className="container mx-auto relative max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-center">
          {/* プロジェクト画像 */}
          <div className="relative lg:col-span-6 lg:mr-8">
            <ScrollReveal direction="left" delay={100}>
              <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden
                bg-gradient-to-br from-card/90 to-background/80 backdrop-blur-sm
                dark:bg-card dark:from-card dark:to-card
                shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.05)]
                hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_8px_24px_rgba(0,0,0,0.08)]
                dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.2)]
                dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.3)]
                group hover:scale-[1.02] transition-all duration-300"
              >
                {/* 背景グラデーション効果（ライトモードのみ） */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  dark:from-primary/2 dark:via-transparent dark:to-accent/2 dark:opacity-0 dark:group-hover:opacity-50"
                 />

                <ProjectImage
                  src={project.image}
                  alt={project.title}
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent
                  group-hover:from-black/20 transition-all duration-500"
                />
              </div>
            </ScrollReveal>
            {/* プロジェクト番号を画像の上に重ねる */}
            <ProjectNumber number={index + 1} />
          </div>

          {/* プロジェクト詳細 */}
          <div className="lg:col-span-6 space-y-3 md:space-y-4 lg:space-y-6 lg:pl-4">
            <ScrollReveal direction="right" delay={200}>
              <div className="space-y-3 md:space-y-4 lg:space-y-5">
                {/* タイトル */}
                <div className="space-y-1.5 md:space-y-2 lg:space-y-3">
                  <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-foreground
                    tracking-tight leading-tight"
                  >
                    {project.title}
                  </h2>

                  {/* 使用技術 - react-icons */}
                  <div className="flex flex-wrap gap-1.5 lg:gap-2 h-[3rem] items-start overflow-hidden">
                    {project.technologies.map((tech) => {
                      const Icon = techIcons[tech];
                      return Icon
                        ? (
                            <div
                              key={tech}
                              className="flex items-center gap-2 text-muted-foreground hover:text-foreground
                            transition-colors duration-300 group/tech"
                              title={tech}
                            >
                              <Icon className="w-4 h-4 group-hover/tech:scale-110 transition-transform duration-200" />
                              <span className="text-xs font-light">{tech}</span>
                            </div>
                          )
                        : (
                            <span
                              key={tech}
                              className="text-xs font-light text-muted-foreground px-2 py-1
                            bg-muted/20 rounded-full"
                            >
                              {tech}
                            </span>
                          );
                    })}
                  </div>
                </div>

                {/* 概要 */}
                <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed font-light
                  max-w-2xl line-clamp-3 md:line-clamp-4"
                >
                  {project.description}
                </p>

                {/* アクションリンク */}
                {(project.url || project.github) && (
                  <div className="flex flex-wrap gap-3 lg:gap-4 pt-2">
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-foreground hover:text-primary
                          transition-colors duration-300 group/link"
                      >
                        <span className="text-base font-light">Demo</span>
                        <FiExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5
                          transition-transform duration-300"
                        />
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-foreground hover:text-primary
                          transition-colors duration-300 group/link"
                      >
                        <span className="text-base font-light">GitHub</span>
                        <FiGithub className="w-3 h-3 group-hover/link:scale-110
                          transition-transform duration-300"
                        />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
