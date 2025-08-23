import { render, screen } from '@testing-library/react';
import React from 'react';
import { HorizontalScrollContainer } from './HorizontalScrollContainer';

describe('HorizontalScrollContainer', () => {
  it('renders only current child', () => {
    render(
      <HorizontalScrollContainer itemCount={2}>
        <div>one</div>
        <div>two</div>
      </HorizontalScrollContainer>,
    );

    expect(screen.getByText('one')).toBeInTheDocument();
  });
});
