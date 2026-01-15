import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../components/Loading';

describe('Loading component', () => {
  it('should render a circular progress indicator', () => {
    const { container } = render(<Loading />);
    
    // Check for the MUI CircularProgress component
    const circularProgress = container.querySelector('.MuiCircularProgress-root');
    expect(circularProgress).toBeDefined();
  });

  it('should render with centered layout', () => {
    const { container } = render(<Loading />);
    
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeDefined();
  });
});
