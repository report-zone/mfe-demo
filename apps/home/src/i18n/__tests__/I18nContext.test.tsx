import { describe, it, expect } from 'vitest';
import { render, screen, renderHook, act } from '@testing-library/react';
import { I18nProvider, useI18n } from '../I18nContext';
import { I18nConfig } from '../index';
import React from 'react';

const testConfig: I18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  translations: {
    en: {
      greeting: 'Hello',
      user: {
        welcome: 'Welcome, {{name}}',
      },
    },
    fr: {
      greeting: 'Bonjour',
      user: {
        welcome: 'Bienvenue, {{name}}',
      },
    },
    de: {},
    zh: {},
    es: {},
    ja: {},
  },
};

describe('I18nContext', () => {
  it('should provide i18n context', () => {
    const TestComponent: React.FC = () => {
      const { t } = useI18n();
      return <div>{t('greeting')}</div>;
    };

    render(
      <I18nProvider config={testConfig}>
        <TestComponent />
      </I18nProvider>
    );

    expect(screen.getByText('Hello')).toBeDefined();
  });

  it('should change language', () => {
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider config={testConfig}>{children}</I18nProvider>,
    });

    expect(result.current.language).toBe('en');
    expect(result.current.t('greeting')).toBe('Hello');

    act(() => {
      result.current.setLanguage('fr');
    });

    expect(result.current.language).toBe('fr');
    expect(result.current.t('greeting')).toBe('Bonjour');
  });

  it('should handle parameters in translations', () => {
    // Clear localStorage to ensure we start with default language
    localStorage.clear();
    
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider config={testConfig}>{children}</I18nProvider>,
    });

    expect(result.current.t('user.welcome', { name: 'John' })).toBe('Welcome, John');
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useI18n());
    }).toThrow('useI18n must be used within an I18nProvider');
  });

  it('should persist language change to localStorage', () => {
    localStorage.clear();
    
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider config={testConfig}>{children}</I18nProvider>,
    });

    expect(localStorage.getItem('selectedLanguage')).toBe(null);

    act(() => {
      result.current.setLanguage('fr');
    });

    expect(localStorage.getItem('selectedLanguage')).toBe('fr');
  });

  it('should sync language changes from other MFEs via custom event', () => {
    localStorage.clear();
    
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider config={testConfig}>{children}</I18nProvider>,
    });

    expect(result.current.language).toBe('en');
    expect(localStorage.getItem('selectedLanguage')).toBe(null);

    // Simulate language change from another MFE
    act(() => {
      window.dispatchEvent(
        new CustomEvent('languageChanged', {
          detail: { language: 'fr' },
        })
      );
    });

    // Should update language state
    expect(result.current.language).toBe('fr');
    // Should persist to localStorage
    expect(localStorage.getItem('selectedLanguage')).toBe('fr');
  });

  it('should load language from localStorage on initialization', () => {
    localStorage.setItem('selectedLanguage', 'fr');
    
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }) => <I18nProvider config={testConfig}>{children}</I18nProvider>,
    });

    // Should initialize with the language from localStorage
    expect(result.current.language).toBe('fr');
    expect(result.current.t('greeting')).toBe('Bonjour');
  });
});
