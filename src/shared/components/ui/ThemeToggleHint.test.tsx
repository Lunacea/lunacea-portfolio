import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ThemeToggleHint from './ThemeToggleHint';

describe('ThemeToggleHint', () => {
  it('renders hint and image alt', () => {
    render(<ThemeToggleHint />);

    expect(screen.getByText(/touch here!/i)).toBeInTheDocument();
    expect(screen.getByAltText('手書き風矢印')).toBeInTheDocument();
  });
});
