import { describe, it, expect } from 'vitest';
import authReducer, {
  setCredentials,
  clearCredentials,
  setLoading,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthIsLoading,
  AuthState,
} from '../slices/authSlice';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
};

describe('authSlice', () => {
  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const user = { username: 'testuser', email: 'test@example.com', groups: ['user'] };
    const state = authReducer(initialState, setCredentials(user));

    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('should handle setCredentials with admin group', () => {
    const user = { username: 'admin', email: 'admin@example.com', groups: ['admin', 'user'] };
    const state = authReducer(initialState, setCredentials(user));

    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('should handle setCredentials without groups', () => {
    const user = { username: 'testuser' };
    const state = authReducer(initialState, setCredentials(user));

    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
  });

  it('should handle clearCredentials', () => {
    const authenticatedState: AuthState = {
      user: { username: 'testuser', email: 'test@example.com', groups: ['admin'] },
      isAuthenticated: true,
      isAdmin: true,
      isLoading: false,
    };

    const state = authReducer(authenticatedState, clearCredentials());

    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it('should handle setLoading', () => {
    const state = authReducer(initialState, setLoading(false));
    expect(state.isLoading).toBe(false);

    const state2 = authReducer(state, setLoading(true));
    expect(state2.isLoading).toBe(true);
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        user: { username: 'testuser', email: 'test@example.com', groups: ['admin'] },
        isAuthenticated: true,
        isAdmin: true,
        isLoading: false,
      },
    };

    it('selectCurrentUser should return the user', () => {
      expect(selectCurrentUser(mockState)).toEqual(mockState.auth.user);
    });

    it('selectIsAuthenticated should return authentication status', () => {
      expect(selectIsAuthenticated(mockState)).toBe(true);
    });

    it('selectIsAdmin should return admin status', () => {
      expect(selectIsAdmin(mockState)).toBe(true);
    });

    it('selectAuthIsLoading should return loading status', () => {
      expect(selectAuthIsLoading(mockState)).toBe(false);
    });
  });
});
