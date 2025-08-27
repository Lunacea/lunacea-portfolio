import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProjectCard } from './ProjectCard';

vi.mock('next/image', () => ({
  default: (props: { alt?: string }) => {
    const { alt } = props;

    return React.createElement('img', { alt });
  },
}));

vi.mock('@/shared/components/ui/ScrollReveal', () => ({
  default: (props: { children: React.ReactNode }) => <div data-testid="reveal">{props.children}</div>,
}));

describe('ProjectCard', () => {
  it('renders title and technologies', () => {
    const project = {
      id: 'p1',
      title: 'Title',
      description: 'desc',
      image: 'img',
      technologies: ['React', 'TypeScript'],
    };

    render(<ProjectCard project={project} index={0} />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});
