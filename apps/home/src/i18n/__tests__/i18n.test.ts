import { describe, it, expect } from 'vitest';
import I18n, { I18nConfig } from '../index';

describe('I18n', () => {
  const testConfig: I18nConfig = {
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
    translations: {
      en: {
        home: {
          title: 'Home',
          welcome: 'Welcome to {{name}}',
        },
      },
      fr: {
        home: {
          title: 'Accueil',
          welcome: 'Bienvenue à {{name}}',
        },
      },
      de: {
        home: {
          title: 'Startseite',
        },
      },
      zh: {},
      es: {},
      ja: {},
    },
  };

  it('should initialize with default language', () => {
    const i18n = new I18n(testConfig);
    expect(i18n.getLanguage()).toBe('en');
  });

  it('should translate simple keys', () => {
    const i18n = new I18n(testConfig);
    expect(i18n.translate('home.title')).toBe('Home');
  });

  it('should translate nested keys', () => {
    const i18n = new I18n(testConfig);
    expect(i18n.translate('home.welcome', { name: 'World' })).toBe('Welcome to World');
  });

  it('should change language', () => {
    const i18n = new I18n(testConfig);
    i18n.setLanguage('fr');
    expect(i18n.getLanguage()).toBe('fr');
    expect(i18n.translate('home.title')).toBe('Accueil');
  });

  it('should fallback to fallback language when translation not found', () => {
    const i18n = new I18n(testConfig);
    i18n.setLanguage('de');
    expect(i18n.translate('home.welcome', { name: 'World' })).toBe('Welcome to World');
  });

  it('should return key when translation not found in any language', () => {
    const i18n = new I18n(testConfig);
    expect(i18n.translate('home.notfound')).toBe('home.notfound');
  });

  it('should handle parameter replacement', () => {
    const i18n = new I18n(testConfig);
    expect(i18n.translate('home.welcome', { name: 'Test' })).toBe('Welcome to Test');
  });

  it('should use t method alias', () => {
    const i18n = new I18n(testConfig);
    expect(i18n.t('home.title')).toBe('Home');
  });
});
