/**
 * Global error handling utilities for the application
 */

const listeners = new Set();

/**
 * Report an error to all registered listeners
 * @param {Error} error - The error object
 * @param {string} context - Where the error occurred
 */
export function reportError(error, context = "Unknown") {
  const errorInfo = {
    message: error?.message || String(error),
    stack: error?.stack,
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
export function withErrorHandling(fn, context = "Async operation") {
  return (...args) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          reportError(error, context);
          throw error;
        });
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
export function onError(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Initialize global error handlers
 */
export function initErrorHandlers() {
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
  const originalFetch = window.fetch;
  window.fetch = (...args) => {
    return originalFetch(...args).catch((error) => {
      reportError(error, "Fetch Error");
      throw error;
    });
  };

  console.log("Global error handlers initialized");
}
