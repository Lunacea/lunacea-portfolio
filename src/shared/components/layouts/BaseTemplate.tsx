'use client';

import Header from '@/shared/components/layouts/Header';
import LocaleSwitcher from '@/shared/components/layouts/LocaleSwitcher';
import MusicController from '@/shared/components/layouts/MusicController';
import NavigationLinks from '@/shared/components/layouts/NavigationLinks';
import SocialLinks from '@/shared/components/layouts/SocialLinks';
import ThemeToggle from '@/shared/components/ui/ThemeToggle';
import { AppConfig } from '@/shared/utils/AppConfig';

export default function BaseTemplate(props: { leftNav?: React.ReactNode; rightNav?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="absolute inset-0 bg-theme-paper bg-theme-overlay" />
      <Header leftNav={<NavigationLinks />} rightNav={<LocaleSwitcher />} />
      <main className="relative lg:ml-64">
        <div className="flex flex-col w-full items-center justify-center pt-28 sm:pt-24 lg:pt-20">
          <div className="text-center w-full flex flex-col items-center overflow-x-clip">
            <h1 className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] xl:text-[14rem] font-semibold leading-none mb-4 tracking-widest uppercase text-neumorphism-theme whitespace-nowrap lg:translate-x-0 text-center font-rajdhani">
              {AppConfig.name.split('').map((char, index) => {
                const charOccurrence = AppConfig.name.split('').slice(0, index + 1).filter(c => c.toLowerCase() === char.toLowerCase()).length;
                return char.toUpperCase() === 'C'
                  ? (
                      <ThemeToggle key={`theme-toggle-c-${AppConfig.name}-${char.toLowerCase()}-${charOccurrence}`} />
                    )
                  : (
                      <span key={`char-${AppConfig.name}-${char.toLowerCase()}-${charOccurrence}`}>{char}</span>
                    );
              })}
            </h1>
          </div>
          <div className="w-full max-w-6xl">
            {props.children}
            <div className="w-full h-16" />
          </div>
        </div>
      </main>
      <div className="fixed bottom-6 right-6 z-1 flex items-center gap-2">
        <MusicController />
      </div>
      <div className="flex fixed bottom-6 left-6 z-99 flex-row gap-2">
        <SocialLinks />
      </div>
    </div>
  );
}
