'use client';

import { useCallback, useRef, useState } from 'react';
import { HorizontalScrollContainer, type HorizontalScrollContainerRef } from '@/features/project/components/HorizontalScrollContainer';
import { ProjectCard } from '@/features/project/components/ProjectCard';
import { ProjectNavigation } from '@/features/project/components/ProjectNavigation';

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

  const projectCards = projects.map((project, index) => (
    <ProjectCard
      key={project.id}
      project={project}
      index={index}
    />
  ));

  return (
    <div className="relative flex flex-col">
      <ProjectNavigation
        projectCount={projects.length}
        currentProject={activeIndex}
        onProjectChangeAction={handleProjectChange}
      />
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
