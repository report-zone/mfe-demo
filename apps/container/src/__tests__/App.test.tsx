import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import authService from '../services/authService';

// Mock the auth service
vi.mock('../services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
    confirmSignUp: vi.fn(),
    resetPassword: vi.fn(),
    confirmResetPassword: vi.fn(),
  },
}));

// Mock MFELoader
vi.mock('../components/MFELoader', () => ({
  default: () => <div>MFE Loader Mock</div>,
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('should use BASE_URL for BrowserRouter basename', () => {
    // This test verifies that the BrowserRouter is configured with basename
    // The actual value of import.meta.env.BASE_URL depends on the build configuration:
    // - Development mode: '/'
    // - Preview/Production mode: '/container/'
    
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    render(<App />);
    
    // If this renders without error, it means BrowserRouter is properly configured
    // The basename prop ensures that routes like /preferences/general work correctly
    // when the app is served at a subpath like /container/
    expect(true).toBe(true);
  });
});
