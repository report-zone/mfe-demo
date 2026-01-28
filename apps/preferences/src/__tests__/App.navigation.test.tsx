import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { I18nProvider } from '@mfe-demo/shared-hooks';
import { i18nConfig } from '../i18n/config';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderAppWithRoute = (initialPath: string) => {
  return render(
    <I18nProvider config={i18nConfig}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </I18nProvider>
  );
};

describe('Preferences MFE - Navigation Behavior', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('should redirect to /preferences/general when at /preferences', () => {
    renderAppWithRoute('/preferences');
    // The useEffect should trigger navigation to /preferences/general
    expect(mockNavigate).toHaveBeenCalledWith('/preferences/general', { replace: true });
  });

  it('should redirect to /preferences/general when at /preferences/', () => {
    renderAppWithRoute('/preferences/');
    // The useEffect should trigger navigation to /preferences/general
    expect(mockNavigate).toHaveBeenCalledWith('/preferences/general', { replace: true });
  });

  it('should NOT redirect when at / (home route)', () => {
    renderAppWithRoute('/');
    // This is the critical fix: preferences MFE should NOT redirect when at root path
    // The root path (/) is for the Home MFE, not preferences
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should NOT redirect when at /preferences/general', () => {
    renderAppWithRoute('/preferences/general');
    // Should not redirect when already at a valid sub-route
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should NOT redirect when at /preferences/themes', () => {
    renderAppWithRoute('/preferences/themes');
    // Should not redirect when already at a valid sub-route
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should NOT redirect when at /preferences/languages', () => {
    renderAppWithRoute('/preferences/languages');
    // Should not redirect when already at a valid sub-route
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
