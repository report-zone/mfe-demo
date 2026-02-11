// Store
export { store, injectReducer } from './store';
export type { RootState, AppDispatch } from './store';

// Typed hooks
export { useAppDispatch, useAppSelector } from './hooks';

// Auth slice
export {
  default as authReducer,
  setCredentials,
  clearCredentials,
  setLoading,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthIsLoading,
} from './slices/authSlice';
export type { AuthUser, AuthState } from './slices/authSlice';

// RTK Query base API
export { baseApi } from './api/baseApi';

// API config
export { apiConfig, getApiConfig } from './apiConfig';
export type { ApiConfig } from './apiConfig';
