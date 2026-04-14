/**
 * Global error handling utilities for the application
 */

interface ErrorInfo {
  message: string;
  stack?: string;
  context: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

type ErrorListener = (errorInfo: ErrorInfo) => void;

const listeners = new Set<ErrorListener>();

/**
 * Report an error to all registered listeners
 * @param {Error | unknown} error - The error object
 * @param {string} context - Where the error occurred
 */
export function reportError(error: Error | unknown, context: string = "Unknown"): void {
  const errorInfo: ErrorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    url: typeof window !== "undefined" ? window.location.href : "",
  };

  console.error(`[${context}]`, errorInfo);

  // Notify all listeners
  listeners.forEach((listener) => {
    try {
      listener(errorInfo);
    } catch (e) {
      console.error("Error in error listener:", e);
    }
  });
}

/**
 * Wrap an async function with error handling
 * @param {Function} fn - Function to wrap
 * @param {string} context - Context for error reporting
 * @returns {Function} Wrapped function
 */
export function withErrorHandling<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  context: string = "Async operation"
): (...args: Args) => Return {
  return (...args: Args) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          reportError(error, context);
          throw error;
        }) as Return;
      }
      return result;
    } catch (error) {
      reportError(error, context);
      throw error;
    }
  };
}

/**
 * Add an error listener
 * @param {Function} listener - Callback function
 * @returns {Function} Unsubscribe function
 */
export function onError(listener: ErrorListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Initialize global error handlers
 */
export function initErrorHandlers(): void {
  if (typeof window === "undefined") return;

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    reportError(event.error || new Error(event.message), "Uncaught Error");
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    reportError(event.reason || new Error("Unhandled Promise Rejection"), "Unhandled Promise");
  });

  // Handle fetch errors
  const originalFetch = window.fetch.bind(window);
  window.fetch = (...args: [RequestInfo | URL, RequestInit | undefined]) => {
    return originalFetch(...args).catch((error) => {
      reportError(error, "Fetch Error");
      throw error;
    });
  };

  console.log("Global error handlers initialized");
}
