/**
 * Storage Service Interface
 * Abstraction for browser storage operations (localStorage, sessionStorage, etc.)
 * Implements Dependency Inversion Principle
 */
export interface IStorageService {
  /**
   * Get an item from storage
   * @param key Storage key
   * @returns The stored value or null if not found
   */
  getItem(key: string): string | null;

  /**
   * Set an item in storage
   * @param key Storage key
   * @param value Value to store
   */
  setItem(key: string, value: string): void;

  /**
   * Remove an item from storage
   * @param key Storage key
   */
  removeItem(key: string): void;

  /**
   * Clear all items from storage
   */
  clear(): void;

  /**
   * Get a key by index
   * @param index Index of the key
   * @returns The key at the specified index or null
   */
  key(index: number): string | null;

  /**
   * Get the number of items in storage
   */
  readonly length: number;
}
