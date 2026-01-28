import { IEventBus } from './interfaces/IEventBus';

/**
 * Window-based EventBus implementation
 * Uses CustomEvent and window.dispatchEvent for cross-MFE communication
 */
export class WindowEventBus implements IEventBus {
  // Map to track handler-to-listener relationships for proper cleanup
  private listenerMap = new WeakMap<Function, EventListener>();

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

    // Store the mapping for proper cleanup
    this.listenerMap.set(handler, listener);

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
      // Get the wrapped listener from the map
      const listener = this.listenerMap.get(handler);
      if (listener) {
        window.removeEventListener(eventName, listener);
        this.listenerMap.delete(handler);
      }
    } catch (error) {
      console.error('WindowEventBus: Error unsubscribing from event', error);
    }
  }
}

// Export singleton instance for convenience
export const windowEventBus = new WindowEventBus();
