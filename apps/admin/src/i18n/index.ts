/**
 * Simple i18n implementation without external dependencies
 */

export type Language = 'en' | 'fr' | 'de' | 'zh' | 'es' | 'ja';

export interface Translations {
  [key: string]: string | Translations;
}

export interface I18nConfig {
  defaultLanguage: Language;
  fallbackLanguage: Language;
  translations: Record<Language, Translations>;
}

class I18n {
  private currentLanguage: Language;
  private config: I18nConfig;

  constructor(config: I18nConfig) {
    this.config = config;
    this.currentLanguage = config.defaultLanguage;
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  translate(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    let translation: string | Translations | undefined =
      this.config.translations[this.currentLanguage];

    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        translation = undefined;
        break;
      }
    }

    // Fallback to fallback language if translation not found
    if (typeof translation !== 'string') {
      let fallbackTranslation: string | Translations | undefined =
        this.config.translations[this.config.fallbackLanguage];

      for (const k of keys) {
        if (fallbackTranslation && typeof fallbackTranslation === 'object') {
          fallbackTranslation = fallbackTranslation[k];
        } else {
          fallbackTranslation = undefined;
          break;
        }
      }

      if (typeof fallbackTranslation === 'string') {
        translation = fallbackTranslation;
      }
    }

    // If still not found, return the key itself
    if (typeof translation !== 'string') {
      return key;
    }

    // Replace parameters if provided
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = (translation as string).replace(`{{${paramKey}}}`, params[paramKey]);
      });
    }

    return translation;
  }

  t = this.translate.bind(this);
}

export default I18n;
