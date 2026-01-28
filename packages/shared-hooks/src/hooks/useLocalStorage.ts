import { useState, useEffect, useCallback } from 'react';

/**
 * A hook for syncing state with localStorage across MFEs
 * 
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @param broadcastEvent - Optional event name to broadcast changes
 * @returns [value, setValue] tuple
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  broadcastEvent?: string
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage and broadcast changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prevValue) => {
          // Allow value to be a function for functional updates
          const valueToStore = typeof value === 'function' 
            ? (value as (prev: T) => T)(prevValue) 
            : value;
          
          // Save to localStorage
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          
          // Broadcast change to other MFEs if event name provided
          if (broadcastEvent) {
            window.dispatchEvent(
              new CustomEvent(broadcastEvent, {
                detail: { value: valueToStore },
              })
            );
          }
          
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, broadcastEvent]
  );

  // Listen for changes from other MFEs
  useEffect(() => {
    if (!broadcastEvent) return;

    const handleStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ value: T }>;
      if (customEvent.detail?.value !== undefined) {
        setStoredValue(customEvent.detail.value);
        
        // Update localStorage when syncing from other MFEs
        try {
          window.localStorage.setItem(key, JSON.stringify(customEvent.detail.value));
        } catch (error) {
          console.error(`Error updating localStorage from sync for key "${key}":`, error);
        }
      }
    };

    window.addEventListener(broadcastEvent, handleStorageChange);
    
    return () => {
      window.removeEventListener(broadcastEvent, handleStorageChange);
    };
  }, [broadcastEvent, key]);

  return [storedValue, setValue];
}
