import { store } from "./store/store.js";
import { initApp } from "./app.js";

if (typeof window !== "undefined") {
  window.store = store;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
