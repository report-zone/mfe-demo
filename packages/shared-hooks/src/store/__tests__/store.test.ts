import { describe, it, expect } from 'vitest';
import { store, injectReducer } from '../store';
import { setCredentials, clearCredentials } from '../slices/authSlice';
import { createSlice } from '@reduxjs/toolkit';

describe('store', () => {
  it('should have auth reducer in initial state', () => {
    const state = store.getState();
    expect(state.auth).toBeDefined();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
  });

  it('should have api reducer in initial state', () => {
    const state = store.getState();
    expect(state.api).toBeDefined();
  });

  it('should dispatch setCredentials and update state', () => {
    const user = { username: 'testuser', email: 'test@example.com', groups: ['user'] };
    store.dispatch(setCredentials(user));

    const state = store.getState();
    expect(state.auth.user).toEqual(user);
    expect(state.auth.isAuthenticated).toBe(true);
  });

  it('should dispatch clearCredentials and reset state', () => {
    store.dispatch(clearCredentials());

    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.auth.isAuthenticated).toBe(false);
  });

  it('should inject a new reducer dynamically', () => {
    const testSlice = createSlice({
      name: 'testMfe',
      initialState: { value: 42 },
      reducers: {},
    });

    injectReducer('testMfe', testSlice.reducer);

    const state = store.getState();
    expect((state as Record<string, unknown>)['testMfe']).toEqual({ value: 42 });
  });

  it('should not overwrite an already injected reducer', () => {
    const anotherSlice = createSlice({
      name: 'testMfe',
      initialState: { value: 99 },
      reducers: {},
    });

    // Try to inject again with the same key - should be a no-op
    injectReducer('testMfe', anotherSlice.reducer);

    const state = store.getState();
    expect((state as Record<string, unknown>)['testMfe']).toEqual({ value: 42 });
  });
});
