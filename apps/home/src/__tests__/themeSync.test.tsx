import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useThemeSync } from '@mfe-demo/shared-hooks';
import { createTheme, Theme } from '@mui/material';

describe('useThemeSync', () => {
  let mockStorageService: any;
  let mockEventBus: any;
  const defaultTheme = createTheme({ palette: { primary: { main: '#1976d2' } } });
  const convertToTheme = (config: unknown): Theme => createTheme(config as any);

  beforeEach(() => {
    // Mock storage service
    mockStorageService = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    // Mock event bus
    mockEventBus = {
      subscribe: vi.fn(() => vi.fn()), // Return unsubscribe function
      dispatch: vi.fn(),
    };
  });

  it('should return default theme when no theme in storage', () => {
    mockStorageService.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useThemeSync(defaultTheme, mockStorageService, mockEventBus, convertToTheme)
    );

    expect(result.current).toBe(defaultTheme);
  });

  it('should load theme from storage on mount', async () => {
    const customTheme = {
      id: 'dark',
      themeConfig: {
        palette: { mode: 'dark', primary: { main: '#90caf9' } },
      },
    };

    mockStorageService.getItem
      .mockReturnValueOnce('dark') // selectedThemeId
      .mockReturnValueOnce(JSON.stringify([customTheme])); // customThemes

    const { result } = renderHook(() =>
      useThemeSync(defaultTheme, mockStorageService, mockEventBus, convertToTheme)
    );

    await waitFor(() => {
      expect(result.current.palette.mode).toBe('dark');
    });
  });

  it('should subscribe to theme change events', () => {
    mockStorageService.getItem.mockReturnValue(null);

    renderHook(() =>
      useThemeSync(defaultTheme, mockStorageService, mockEventBus, convertToTheme)
    );

    expect(mockEventBus.subscribe).toHaveBeenCalledWith(
      'themeChanged',
      expect.any(Function)
    );
  });

  it('should update theme when themeChanged event is dispatched', async () => {
    mockStorageService.getItem.mockReturnValue(null);
    let themeChangedHandler: any;

    mockEventBus.subscribe.mockImplementation((event: string, handler: any) => {
      if (event === 'themeChanged') {
        themeChangedHandler = handler;
      }
      return vi.fn();
    });

    const { result } = renderHook(() =>
      useThemeSync(defaultTheme, mockStorageService, mockEventBus, convertToTheme)
    );

    // Initially default theme
    expect(result.current.palette.primary.main).toBe('#1976d2');

    // Simulate theme change event
    const newThemeConfig = {
      palette: { mode: 'dark', primary: { main: '#90caf9' } },
    };
    themeChangedHandler({ themeConfig: newThemeConfig });

    await waitFor(() => {
      expect(result.current.palette.primary.main).toBe('#90caf9');
    });
  });
});
