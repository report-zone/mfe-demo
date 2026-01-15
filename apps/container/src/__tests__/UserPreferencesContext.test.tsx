import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { UserPreferencesProvider, useUserPreferences } from '../contexts/UserPreferencesContext';

const TestComponent = () => {
  const { preferences, updatePreference, resetPreferences } = useUserPreferences();

  return (
    <div>
      <div data-testid="theme">{preferences.theme}</div>
      <div data-testid="language">{preferences.language}</div>
      <div data-testid="notifications">{String(preferences.notifications)}</div>
      <div data-testid="emailUpdates">{String(preferences.emailUpdates)}</div>
      <button onClick={() => updatePreference('theme', 'dark')}>Set Dark Theme</button>
      <button onClick={() => updatePreference('language', 'es')}>Set Spanish</button>
      <button onClick={() => updatePreference('notifications', false)}>Disable Notifications</button>
      <button onClick={() => updatePreference('emailUpdates', true)}>Enable Email Updates</button>
      <button onClick={resetPreferences}>Reset Preferences</button>
    </div>
  );
};

describe('UserPreferencesContext', () => {
  it('should provide default preferences', () => {
    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    expect(screen.getByTestId('language')).toHaveTextContent('en');
    expect(screen.getByTestId('notifications')).toHaveTextContent('true');
    expect(screen.getByTestId('emailUpdates')).toHaveTextContent('false');
  });

  it('should update theme preference', async () => {
    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>
    );

    const setDarkThemeButton = screen.getByText('Set Dark Theme');

    await act(async () => {
      setDarkThemeButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    });
  });

  it('should update language preference', async () => {
    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>
    );

    const setSpanishButton = screen.getByText('Set Spanish');

    await act(async () => {
      setSpanishButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('language')).toHaveTextContent('es');
    });
  });

  it('should update notifications preference', async () => {
    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>
    );

    const disableNotificationsButton = screen.getByText('Disable Notifications');

    await act(async () => {
      disableNotificationsButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('notifications')).toHaveTextContent('false');
    });
  });

  it('should update emailUpdates preference', async () => {
    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>
    );

    const enableEmailUpdatesButton = screen.getByText('Enable Email Updates');

    await act(async () => {
      enableEmailUpdatesButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('emailUpdates')).toHaveTextContent('true');
    });
  });

  it('should reset preferences to defaults', async () => {
    render(
      <UserPreferencesProvider>
        <TestComponent />
      </UserPreferencesProvider>
    );

    // Change multiple preferences
    await act(async () => {
      screen.getByText('Set Dark Theme').click();
    });

    await act(async () => {
      screen.getByText('Set Spanish').click();
    });

    await act(async () => {
      screen.getByText('Disable Notifications').click();
    });

    // Verify changes
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      expect(screen.getByTestId('language')).toHaveTextContent('es');
      expect(screen.getByTestId('notifications')).toHaveTextContent('false');
    });

    // Reset
    await act(async () => {
      screen.getByText('Reset Preferences').click();
    });

    // Verify reset
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light');
      expect(screen.getByTestId('language')).toHaveTextContent('en');
      expect(screen.getByTestId('notifications')).toHaveTextContent('true');
      expect(screen.getByTestId('emailUpdates')).toHaveTextContent('false');
    });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useUserPreferences must be used within a UserPreferencesProvider');

    console.error = originalError;
  });
});
