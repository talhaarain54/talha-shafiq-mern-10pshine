import { describe, it, expect, beforeEach, } from 'vitest';
import themeReducer, { toggleTheme, setTheme } from '../../features/themeSlice';

describe('themeSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggleTheme should switch from light to dark', () => {
    const lightState = { mode: 'light' };
    const state = themeReducer(lightState, toggleTheme());
    expect(state.mode).toBe('dark');
  });

  it('toggleTheme should switch from dark to light', () => {
    const darkState = { mode: 'dark' };
    const state = themeReducer(darkState, toggleTheme());
    expect(state.mode).toBe('light');
  });

  it('toggleTheme should persist the new theme to localStorage', () => {
    themeReducer({ mode: 'light' }, toggleTheme());
    expect(localStorage.getItem('notebase-theme')).toBe('dark');
  });

  it('setTheme should set mode to a specific value', () => {
    const state = themeReducer({ mode: 'light' }, setTheme('dark'));
    expect(state.mode).toBe('dark');
  });

  it('setTheme should save to localStorage', () => {
    themeReducer({ mode: 'light' }, setTheme('dark'));
    expect(localStorage.getItem('notebase-theme')).toBe('dark');
  });
});