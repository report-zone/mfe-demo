import { IStorageService } from './interfaces/IStorageService';

/**
 * LocalStorage implementation of IStorageService
 * Concrete implementation for browser localStorage
 */
export class LocalStorageService implements IStorageService {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('LocalStorageService: Error getting item', error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('LocalStorageService: Error setting item', error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('LocalStorageService: Error removing item', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('LocalStorageService: Error clearing storage', error);
    }
  }

  key(index: number): string | null {
    try {
      return localStorage.key(index);
    } catch (error) {
      console.error('LocalStorageService: Error getting key', error);
      return null;
    }
  }

  get length(): number {
    try {
      return localStorage.length;
    } catch (error) {
      console.error('LocalStorageService: Error getting length', error);
      return 0;
    }
  }
}

// Export singleton instance for convenience
export const localStorageService = new LocalStorageService();
