import { I18nConfig } from './index';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import ja from './locales/ja.json';

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  translations: {
    en,
    fr,
    de,
    zh,
    es,
    ja,
  },
};
