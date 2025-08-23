import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ProjectNavigation } from './ProjectNavigation';

describe('ProjectNavigation', () => {
  it('renders numbered buttons and handles click', () => {
    const onChange = vi.fn();
    render(
      <ProjectNavigation projectCount={3} currentProject={0} onProjectChangeAction={onChange} />,
    );

    // Accessible name is provided by aria-label in the component, so query by that
    expect(screen.getByRole('button', { name: 'プロジェクト 1に移動' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'プロジェクト 2に移動' }));

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
