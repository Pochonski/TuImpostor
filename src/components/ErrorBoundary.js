import { el } from "../dom/el.js";
import { onError } from "../utils/errorHandler.js";

/**
 * ErrorBoundary component - catches and displays errors in the UI
 */
export class ErrorBoundary {
  constructor({ fallback, onError: errorCallback } = {}) {
    this.fallback = fallback;
    this.errorCallback = errorCallback;
    this.hasError = false;
    this.error = null;
    this.unsubscribe = null;
  }

  /**
   * Wrap a render function with error handling
   * @param {Function} renderFn - Function that returns content to render
   * @returns {Object} View model with title, subtitle, and content
   */
  wrapRender(renderFn) {
    try {
      const result = renderFn();
      this.hasError = false;
      this.error = null;
      return result;
    } catch (error) {
      this.hasError = true;
      this.error = error;

      // Report the error
      if (this.errorCallback) {
        this.errorCallback(error);
      }

      // Return error UI
      return this.renderError(error);
    }
  }

  /**
   * Render the error state
   * @param {Error} error - The caught error
   * @returns {Object} View model for error display
   */
  renderError(error) {
    const content = el("div", { class: "error-boundary" }, [
      el("div", { class: "error-icon" }, ["⚠️"]),
      el("h2", { class: "h1", text: "Algo salió mal" }),
      el("p", {
        class: "p",
        style: "margin: 12px 0; text-align: center;",
        text: "Lo sentimos,发生了 un错误 inesperado.",
      }),
      el("div", { class: "error-details" }, [
        el("p", {
          class: "small",
          text: process.env.NODE_ENV === "development" 
            ? error?.message || "Error desconocido"
            : "Por favor, intenta recargar la página.",
        }),
      ]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-primary",
          type: "button",
          onclick: () => {
            this.hasError = false;
            this.error = null;
            window.location.reload();
          },
        }, ["Recargar"]),
        el("button", {
          class: "btn btn-secondary",
          type: "button",
          onclick: () => {
            this.hasError = false;
            this.error = null;
            window.history.back();
          },
        }, ["Volver atrás"]),
      ]),
    ]);

    return {
      title: "Error",
      subtitle: "Ha ocurrido un problema",
      content,
      isError: true,
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

/**
 * HOC to wrap a component with error boundary
 * @param {Function} Component - Component to wrap
 * @param {Object} options - Error boundary options
 * @returns {Function} Wrapped component
 */
export function withErrorBoundary(Component, options = {}) {
  return function ErrorBoundedComponent(props) {
    const boundary = new ErrorBoundary(options);
    return boundary.wrapRender(() => Component(props));
  };
}
