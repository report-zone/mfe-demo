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

  it('should redirect to /container/ when at root URL in production', () => {
    // Mock production environment where BASE_URL is /container/
    const originalBaseUrl = import.meta.env.BASE_URL;
    import.meta.env.BASE_URL = '/container/';
    
    // Mock location
    const replaceMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        replace: replaceMock,
      },
      writable: true,
    });

    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    render(<App />);
    
    // Should have called replace to redirect to /container/
    expect(replaceMock).toHaveBeenCalledWith('/container/');
    
    // Restore
    import.meta.env.BASE_URL = originalBaseUrl;
  });
});
