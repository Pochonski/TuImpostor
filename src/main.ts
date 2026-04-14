import { store } from "./store/store.js";
import { initApp } from "./app.js";
import { initErrorHandlers, reportError } from "./utils/errorHandler.js";

if (typeof window !== "undefined") {
  (window as unknown as { store: typeof store }).store = store;
}

// Initialize global error handlers
initErrorHandlers();

async function bootstrap() {
  try {
    await initApp();
  } catch (error) {
    reportError(error, "App Initialization");
    // Show user-friendly error
    const app = document.getElementById("app");
    if (app) {
      app.innerHTML = `
        <div style="padding: 20px; text-align: center; color: white;">
          <h1>Error al cargar la aplicación</h1>
          <p>Por favor, recarga la página.</p>
          <button onclick="location.reload()">Recargar</button>
        </div>
      `;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
