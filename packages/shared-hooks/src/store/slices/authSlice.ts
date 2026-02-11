/**
 * Auth Slice - Stores Cognito login data in Redux
 *
 * This slice manages authentication state including user information,
 * authentication status, and admin privileges from Cognito.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  username: string;
  email?: string;
  groups?: string[];
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isAdmin = action.payload.groups?.includes('admin') ?? false;
      state.isLoading = false;
    },
    clearCredentials: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setLoading } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.isAdmin;
export const selectAuthIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;

export default authSlice.reducer;
