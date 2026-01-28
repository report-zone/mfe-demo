/**
 * Event Bus Interface
 * Abstraction for cross-component/cross-MFE communication
 * Implements Dependency Inversion Principle
 */
export interface IEventBus {
  /**
   * Dispatch an event
   * @param eventName Name of the event
   * @param detail Event payload
   */
  dispatch<T = unknown>(eventName: string, detail?: T): void;

  /**
   * Subscribe to an event
   * @param eventName Name of the event
   * @param handler Event handler function
   * @returns Cleanup function to unsubscribe
   */
  subscribe<T = unknown>(
    eventName: string,
    handler: (detail: T) => void
  ): () => void;

  /**
   * Unsubscribe from an event
   * @param eventName Name of the event
   * @param handler Event handler function
   */
  unsubscribe<T = unknown>(eventName: string, handler: (detail: T) => void): void;
}
