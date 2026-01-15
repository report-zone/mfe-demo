import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MFEPlaceholder from '../components/MFEPlaceholder';

describe('MFEPlaceholder component', () => {
  it('should render the MFE name in heading', () => {
    render(<MFEPlaceholder name="TestApp" />);
    
    expect(screen.getByText('TestApp MFE')).toBeDefined();
  });

  it('should render description with MFE name', () => {
    render(<MFEPlaceholder name="TestApp" />);
    
    expect(screen.getByText(/This is a placeholder for the TestApp micro frontend application/)).toBeDefined();
  });

  it('should render production note', () => {
    render(<MFEPlaceholder name="TestApp" />);
    
    expect(screen.getByText(/In production, this component will be loaded dynamically/)).toBeDefined();
  });

  it('should render different names correctly', () => {
    const { rerender } = render(<MFEPlaceholder name="Preferences" />);
    expect(screen.getByText('Preferences MFE')).toBeDefined();
    
    rerender(<MFEPlaceholder name="Account" />);
    expect(screen.getByText('Account MFE')).toBeDefined();
  });
});
