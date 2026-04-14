import { store } from "./store/store.js";
import { initApp } from "./app.js";

if (typeof window !== "undefined") {
  window.store = store;
}

async function bootstrap() {
  await initApp();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
