import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * Generic shared state hook that syncs across MFEs via CustomEvents
 * 
 * Usage:
 * 1. Create a context provider in your shared package
 * 2. Use the hook in any MFE that needs the shared state
 * 3. State changes broadcast to all MFEs via CustomEvents
 */

interface SharedStateContextValue<T> {
  state: T;
  setState: (value: T | ((prev: T) => T)) => void;
}

export function createSharedStateHook<T>(
  eventName: string,
  initialValue: T
) {
  const Context = createContext<SharedStateContextValue<T> | undefined>(undefined);

  const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setStateInternal] = useState<T>(initialValue);
    const isUpdatingFromEvent = React.useRef(false);

    const setState = (value: T | ((prev: T) => T)) => {
      setStateInternal((prevState) => {
        const newState = typeof value === 'function' 
          ? (value as (prev: T) => T)(prevState) 
          : value;
        
        // Only broadcast if the change originated locally (not from another MFE)
        if (!isUpdatingFromEvent.current) {
          window.dispatchEvent(
            new CustomEvent(eventName, {
              detail: { state: newState },
            })
          );
        }
        
        return newState;
      });
    };

    // Listen for changes from other MFEs
    useEffect(() => {
      const handleStateChange = (event: Event) => {
        const customEvent = event as CustomEvent<{ state: T }>;
        if (customEvent.detail?.state !== undefined) {
          // Mark that we're updating from an external event
          isUpdatingFromEvent.current = true;
          setStateInternal(customEvent.detail.state);
          // Reset the flag after state update
          isUpdatingFromEvent.current = false;
        }
      };

      window.addEventListener(eventName, handleStateChange);
      
      return () => {
        window.removeEventListener(eventName, handleStateChange);
      };
    }, []);

    return (
      <Context.Provider value={{ state, setState }}>
        {children}
      </Context.Provider>
    );
  };

  const useSharedState = (): SharedStateContextValue<T> => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(
        `useSharedState must be used within a Provider for event "${eventName}"`
      );
    }
    return context;
  };

  return { Provider, useSharedState };
}
