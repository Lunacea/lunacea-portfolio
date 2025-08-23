import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import EmptyStateCard from './EmptyStateCard';

describe('EmptyStateCard', () => {
  it('renders title, description and icon', () => {
    render(<EmptyStateCard title="Title" description="Desc" icon={<span data-testid="icon" />} />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
