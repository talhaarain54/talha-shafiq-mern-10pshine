import { describe, it, expect } from 'vitest';
import authReducer, { login, logout, setLoading, setError, setUser, setAccessToken } from '../../features/authSlice';

const initialState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  loading: false,
  error: null,
};

describe('authSlice', () => {
  describe('initial state', () => {
    it('should return the correct initial state', () => {
      const state = authReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual(initialState);
    });
  });

  describe('login action', () => {
    it('should set user, token, and isAuthenticated on login', () => {
      const payload = {
        user: { _id: '1', name: 'Talha', email: 'talha@test.com' },
        accessToken: 'test-token-123',
      };
      const state = authReducer(initialState, login(payload));

      expect(state.user).toEqual(payload.user);
      expect(state.accessToken).toBe('test-token-123');
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('logout action', () => {
    it('should clear all auth state on logout', () => {
      const loggedInState = {
        user: { _id: '1', name: 'Talha' },
        isAuthenticated: true,
        accessToken: 'token',
        loading: false,
        error: null,
      };
      const state = authReducer(loggedInState, logout());

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBeNull();
    });
  });

  describe('setLoading action', () => {
    it('should set loading to true', () => {
      const state = authReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const state = authReducer({ ...initialState, loading: true }, setLoading(false));
      expect(state.loading).toBe(false);
    });
  });

  describe('setError action', () => {
    it('should set error message and stop loading', () => {
      const state = authReducer({ ...initialState, loading: true }, setError('Something went wrong'));
      expect(state.error).toBe('Something went wrong');
      expect(state.loading).toBe(false);
    });
  });

  describe('setUser action', () => {
    it('should set user and mark as authenticated', () => {
      const user = { _id: '1', name: 'Talha' };
      const state = authReducer(initialState, setUser(user));
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('setAccessToken action', () => {
    it('should update access token', () => {
      const state = authReducer(initialState, setAccessToken('new-token'));
      expect(state.accessToken).toBe('new-token');
    });
  });
});