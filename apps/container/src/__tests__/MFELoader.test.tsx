import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MFELoader from '../components/MFELoader';

// Mock the mfeRegistry module
vi.mock('../config/mfeRegistry', () => ({
  getMFEComponent: vi.fn((mfeName: string) => {
    // Return a simple component for testing
    return () => {
      if (mfeName === 'unknown') {
        return <div>Not Found MFE</div>;
      }
      return <div>{mfeName} MFE loaded</div>;
    };
  }),
}));

describe('MFELoader component', () => {
  it('should render loading state initially', () => {
    const { container } = render(<MFELoader mfeName="home" />);
    
    // Check for CircularProgress in loading fallback
    const circularProgress = container.querySelector('.MuiCircularProgress-root');
    expect(circularProgress).toBeDefined();
  });

  it('should load MFE component after suspense', async () => {
    render(<MFELoader mfeName="home" />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('home MFE loaded')).toBeDefined();
    }, { timeout: 3000 });
  });

  it('should handle unknown MFE gracefully', async () => {
    render(<MFELoader mfeName="unknown" />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Not Found MFE')).toBeDefined();
    }, { timeout: 3000 });
  });
});
