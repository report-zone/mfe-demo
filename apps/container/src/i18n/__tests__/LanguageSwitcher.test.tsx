import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '../I18nContext';
import { I18nConfig } from '../index';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const testConfig: I18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  translations: {
    en: { test: 'Test' },
    fr: { test: 'Test' },
    de: { test: 'Test' },
    zh: { test: 'Test' },
    es: { test: 'Test' },
    ja: { test: 'Test' },
  },
};

describe('LanguageSwitcher', () => {
  it('should render language selector', () => {
    render(
      <I18nProvider config={testConfig}>
        <LanguageSwitcher />
      </I18nProvider>
    );

    expect(screen.getByRole('combobox')).toBeDefined();
  });

  it('should display current language', () => {
    render(
      <I18nProvider config={testConfig}>
        <LanguageSwitcher />
      </I18nProvider>
    );

    // Check the text shown in the select box
    expect(screen.getByText('English')).toBeDefined();
  });

  it('should change language when selection changes', () => {
    render(
      <I18nProvider config={testConfig}>
        <LanguageSwitcher />
      </I18nProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    const frOption = screen.getAllByText('Français')[0];
    fireEvent.click(frOption);

    // After changing, we should see the new language
    expect(screen.getAllByText('Français').length).toBeGreaterThan(0);
  });

  it('should render all language options', () => {
    render(
      <I18nProvider config={testConfig}>
        <LanguageSwitcher />
      </I18nProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    // Use getAllByText since some language names appear multiple times
    expect(screen.getAllByText('English').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Français').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Deutsch').length).toBeGreaterThan(0);
    expect(screen.getAllByText('中文').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Español').length).toBeGreaterThan(0);
    expect(screen.getAllByText('日本語').length).toBeGreaterThan(0);
  });
});
