// Services
export { LocalStorageService, localStorageService } from './services/localStorageService';
export { WindowEventBus, windowEventBus } from './services/windowEventBus';
export type { IStorageService } from './services/interfaces/IStorageService';
export type { IEventBus } from './services/interfaces/IEventBus';

// I18n
export { default as I18n } from './i18n/index';
export type { Language, Translations, I18nConfig } from './i18n/index';
export { I18nProvider, useI18n } from './i18n/I18nContext';

// Hooks
export { useLocalStorage } from './hooks/useLocalStorage';
export { createSharedStateHook } from './hooks/createSharedStateHook';
export { useThemeSync } from './hooks/useThemeSync';

// Store (Redux + RTK Query)
export {
  store,
  injectReducer,
  useAppDispatch,
  useAppSelector,
  authReducer,
  setCredentials,
  clearCredentials,
  setLoading,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthIsLoading,
  baseApi,
  apiConfig,
  getApiConfig,
} from './store';
export type { RootState, AppDispatch, AuthUser, AuthState, ApiConfig } from './store';
