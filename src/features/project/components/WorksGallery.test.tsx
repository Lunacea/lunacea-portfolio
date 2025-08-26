import { render, screen } from '@testing-library/react';
import React from 'react';
import { WorksGallery } from './WorksGallery';

vi.mock('./ProjectNavigation', () => ({
  ProjectNavigation: (props: { currentProject: number; projectCount: number }) => (
    <div data-testid="project-nav">{`${props.currentProject + 1}/${props.projectCount}`}</div>
  ),
}));

vi.mock('./HorizontalScrollContainer', () => ({
  HorizontalScrollContainer: (props: { children: React.ReactNode }) => <div data-testid="h-scroll">{props.children}</div>,
}));

vi.mock('./ProjectCard', () => ({
  ProjectCard: (props: { project: { title: string } }) => <div data-testid="project-card">{props.project.title}</div>,
}));

describe('WorksGallery', () => {
  it('renders navigation and project cards', () => {
    const projects = [
      { id: '1', title: 'P1', description: 'd', image: 'i', technologies: [] },
      { id: '2', title: 'P2', description: 'd', image: 'i', technologies: [] },
    ];

    render(<WorksGallery projects={projects} />);

    expect(screen.getByTestId('project-nav')).toBeInTheDocument();
    expect(screen.getAllByTestId('project-card').length).toBe(2);
  });
});
