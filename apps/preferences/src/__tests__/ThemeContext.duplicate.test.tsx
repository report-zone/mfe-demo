import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeContextProvider, useThemeContext } from '../context/ThemeContext';
import { CustomTheme } from '../types/theme.types';

// Mock storage service
class MockStorageService {
  private storage: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  key(index: number): string | null {
    const keys = Array.from(this.storage.keys());
    return keys[index] || null;
  }

  get length(): number {
    return this.storage.size;
  }
}

// Mock event bus
class MockEventBus {
  dispatch<T = unknown>(_eventName: string, _detail?: T): void {
    // No-op for tests
  }

  subscribe<T = unknown>(_eventName: string, _handler: (detail: T) => void): () => void {
    return () => {}; // Return unsubscribe function
  }

  unsubscribe<T = unknown>(_eventName: string, _handler: (detail: T) => void): void {
    // No-op for tests
  }
}

describe('ThemeContext - Duplicate Theme Prevention', () => {
  let mockStorage: MockStorageService;
  let mockEventBus: MockEventBus;

  beforeEach(() => {
    mockStorage = new MockStorageService();
    mockEventBus = new MockEventBus();
  });

  it('should not show duplicate Custom theme after selecting and reloading', () => {
    // Render hook with mock storage
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => (
        <ThemeContextProvider storageService={mockStorage} eventBus={mockEventBus}>
          {children}
        </ThemeContextProvider>
      ),
    });

    // Initially, should have 3 default themes (Light, Dark, Custom)
    expect(result.current.themes).toHaveLength(3);
    const customTheme = result.current.themes.find(t => t.id === 'custom');
    expect(customTheme).toBeDefined();

    // Select Custom theme
    act(() => {
      result.current.setTheme(customTheme!);
    });

    // Verify the theme was selected
    expect(result.current.currentTheme.id).toBe('custom');

    // Verify Custom theme was saved to custom storage
    const storedCustomThemes = mockStorage.getItem('custom');
    expect(storedCustomThemes).toBeTruthy();
    const parsedCustomThemes = JSON.parse(storedCustomThemes!);
    expect(parsedCustomThemes.some((t: CustomTheme) => t.id === 'custom')).toBe(true);

    // Simulate page reload by creating a new context instance with the same storage
    const { result: reloadedResult } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => (
        <ThemeContextProvider storageService={mockStorage} eventBus={mockEventBus}>
          {children}
        </ThemeContextProvider>
      ),
    });

    // After reload, should still have only 3 themes (no duplicates)
    expect(reloadedResult.current.themes).toHaveLength(3);

    // Verify Custom theme appears only once
    const customThemes = reloadedResult.current.themes.filter(t => t.id === 'custom');
    expect(customThemes).toHaveLength(1);

    // Verify the selected theme is still Custom
    expect(reloadedResult.current.currentTheme.id).toBe('custom');
  });

  it('should not show duplicate default themes when multiple are saved to storage', () => {
    // Pre-populate storage with all default themes
    const defaultThemes = [
      { id: 'light', name: 'Light', isCustom: false, themeConfig: { palette: { mode: 'light' } } },
      { id: 'dark', name: 'Dark', isCustom: false, themeConfig: { palette: { mode: 'dark' } } },
      { id: 'custom', name: 'Custom', isCustom: false, themeConfig: {} },
    ];
    mockStorage.setItem('customThemes', JSON.stringify(defaultThemes));

    // Render hook with mock storage
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => (
        <ThemeContextProvider storageService={mockStorage} eventBus={mockEventBus}>
          {children}
        </ThemeContextProvider>
      ),
    });

    // Should only have 3 themes, not 6 (no duplicates)
    expect(result.current.themes).toHaveLength(3);

    // Each theme should appear only once
    const themeIds = result.current.themes.map(t => t.id);
    const uniqueThemeIds = new Set(themeIds);
    expect(themeIds.length).toBe(uniqueThemeIds.size);
  });

  it('should keep custom themes separate from default themes', () => {
    // Pre-populate storage with default theme and a custom theme
    const storedThemes = [
      { id: 'custom', name: 'Custom', isCustom: false, themeConfig: {} },
      { id: 'custom-1', name: 'My Custom Theme', isCustom: true, themeConfig: {} },
    ];
    mockStorage.setItem('customThemes', JSON.stringify(storedThemes));

    // Render hook with mock storage
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => (
        <ThemeContextProvider storageService={mockStorage} eventBus={mockEventBus}>
          {children}
        </ThemeContextProvider>
      ),
    });

    // Should have 4 themes: 3 defaults + 1 custom
    expect(result.current.themes).toHaveLength(4);

    // Verify Custom appears only once
    const customThemes = result.current.themes.filter(t => t.id === 'custom');
    expect(customThemes).toHaveLength(1);

    // Verify custom theme is present
    const customTheme = result.current.themes.find(t => t.id === 'custom-1');
    expect(customTheme).toBeDefined();
    expect(customTheme?.name).toBe('My Custom Theme');
  });

  it('should maintain theme list correctly after adding custom theme when Custom is in storage', () => {
    // Pre-populate storage with Custom theme
    const storedThemes = [{ id: 'custom', name: 'Custom', isCustom: false, themeConfig: {} }];
    mockStorage.setItem('customThemes', JSON.stringify(storedThemes));

    // Render hook with mock storage
    const { result } = renderHook(() => useThemeContext(), {
      wrapper: ({ children }) => (
        <ThemeContextProvider storageService={mockStorage} eventBus={mockEventBus}>
          {children}
        </ThemeContextProvider>
      ),
    });

    // Add a custom theme
    const newCustomTheme: CustomTheme = {
      id: 'custom-new',
      name: 'New Custom Theme',
      isCustom: true,
      theme: {} as any,
      themeConfig: {},
    };

    act(() => {
      result.current.addCustomTheme(newCustomTheme);
    });

    // Should have 4 themes: 3 defaults + 1 custom (no duplicate Custom)
    expect(result.current.themes).toHaveLength(4);

    // Verify Custom appears only once
    const customThemes = result.current.themes.filter(t => t.id === 'custom');
    expect(customThemes).toHaveLength(1);
  });
});
