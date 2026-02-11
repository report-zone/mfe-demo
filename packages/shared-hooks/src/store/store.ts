/**
 * Redux Store Configuration
 *
 * Central store shared across all MFEs. Reducers are organized by
 * MFE and/or functionality for clear separation of concerns.
 *
 * Structure:
 *   - auth: Authentication state (Cognito user data)
 *   - api: RTK Query cache (shared across all MFE API endpoints)
 *
 * MFEs can inject additional reducers and API endpoints at runtime.
 */

import { configureStore, combineReducers, Reducer } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { baseApi } from './api/baseApi';

const staticReducers = {
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
};

const createRootReducer = (asyncReducers: Record<string, Reducer> = {}) =>
  combineReducers({
    ...staticReducers,
    ...asyncReducers,
  });

export const store = configureStore({
  reducer: createRootReducer(),
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

// Allow MFEs to inject their own reducers at runtime
const asyncReducers: Record<string, Reducer> = {};

export const injectReducer = (key: string, reducer: Reducer) => {
  if (asyncReducers[key]) {
    return;
  }
  asyncReducers[key] = reducer;
  store.replaceReducer(createRootReducer(asyncReducers));
};

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
