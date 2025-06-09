'use client';

import type { HorizontalScrollContainerRef } from '@/components/HorizontalScrollContainer';
import { useCallback, useRef, useState } from 'react';
import { HorizontalScrollContainer } from '@/components/HorizontalScrollContainer';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectNavigation } from '@/components/ProjectNavigation';

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  url?: string;
  github?: string;
};

type WorksGalleryProps = {
  projects: Project[];
};

export function WorksGallery({ projects }: WorksGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HorizontalScrollContainerRef>(null);

  const handleScroll = useCallback((_scrollProgress: number, currentIndex: number) => {
    setActiveIndex(currentIndex);
  }, []);

  const handleProjectChange = useCallback((index: number) => {
    scrollContainerRef.current?.scrollToIndex(index);
  }, []);

  // ProjectCardの配列を作成
  const projectCards = projects.map((project, index) => (
    <ProjectCard
      key={project.id}
      project={project}
      index={index}
    />
  ));

  return (
    <div className="relative flex flex-col">
      {/* プロジェクトナビゲーション */}
      <ProjectNavigation
        projectCount={projects.length}
        currentProject={activeIndex}
        onProjectChangeAction={handleProjectChange}
      />
      {/* 仮想リスト横スクロールギャラリー */}
      <HorizontalScrollContainer
        ref={scrollContainerRef}
        onScroll={handleScroll}
        itemCount={projects.length}
      >
        {projectCards}
      </HorizontalScrollContainer>
    </div>
  );
}
