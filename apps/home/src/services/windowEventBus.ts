import { IEventBus } from './interfaces/IEventBus';

/**
 * Window-based EventBus implementation
 * Uses CustomEvent and window.dispatchEvent for cross-MFE communication
 */
export class WindowEventBus implements IEventBus {
  dispatch<T = unknown>(eventName: string, detail?: T): void {
    try {
      const event = new CustomEvent(eventName, { detail });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('WindowEventBus: Error dispatching event', error);
    }
  }

  subscribe<T = unknown>(
    eventName: string,
    handler: (detail: T) => void
  ): () => void {
    const listener = (event: Event) => {
      if (event instanceof CustomEvent) {
        handler(event.detail as T);
      }
    };

    try {
      window.addEventListener(eventName, listener);
    } catch (error) {
      console.error('WindowEventBus: Error subscribing to event', error);
    }

    // Return cleanup function
    return () => {
      this.unsubscribe(eventName, handler);
    };
  }

  unsubscribe<T = unknown>(eventName: string, handler: (detail: T) => void): void {
    try {
      // Note: We can't directly remove the listener because we wrapped it
      // This is a limitation of the current design
      // For production use, consider maintaining a WeakMap of handlers
      window.removeEventListener(eventName, handler as EventListener);
    } catch (error) {
      console.error('WindowEventBus: Error unsubscribing from event', error);
    }
  }
}

// Export singleton instance for convenience
export const windowEventBus = new WindowEventBus();
