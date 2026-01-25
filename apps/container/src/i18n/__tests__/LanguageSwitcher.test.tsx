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

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('en');
  });

  it('should change language when selection changes', () => {
    render(
      <I18nProvider config={testConfig}>
        <LanguageSwitcher />
      </I18nProvider>
    );

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.mouseDown(select);

    const frOption = screen.getByText('Français');
    fireEvent.click(frOption);

    expect(select.value).toBe('fr');
  });

  it('should render all language options', () => {
    render(
      <I18nProvider config={testConfig}>
        <LanguageSwitcher />
      </I18nProvider>
    );

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    expect(screen.getByText('English')).toBeDefined();
    expect(screen.getByText('Français')).toBeDefined();
    expect(screen.getByText('Deutsch')).toBeDefined();
    expect(screen.getByText('中文')).toBeDefined();
    expect(screen.getByText('Español')).toBeDefined();
    expect(screen.getByText('日本語')).toBeDefined();
  });
});
