import { store } from "./store/store.js";
import { HYDRATE_STATE } from "./store/actions.js";
import { renderApp, setRoute, getRouteFromLocation, normalizeRoute, registerRender } from "./router.js";
import { hydrateApp, persistApp } from "./lifecycle.js";
import type { AppState } from "./store/types.js";

export function render(): void {
  const root = document.getElementById("app");
  if (!root) return;
  const state = store.getState();
  renderApp(root, state.route, {
    onNavigate: (to: string) => setRoute(to, { push: true }),
    onRefresh: render,
    persist: persistApp,
  });
}

function interceptLinkClicks(): void {
  document.addEventListener("click", (ev: Event) => {
    const target = ev.target as HTMLElement;
    const a = target?.closest?.("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("/")) return;
    ev.preventDefault();
    setRoute(href, { push: true });
  });
}

function onPopState(): void {
  window.addEventListener("popstate", () => {
    const route = history.state?.route ?? getRouteFromLocation();
    setRoute(normalizeRoute(route), { push: false });
  });
}

function ensureKnownInitialRoute(): void {
  const initial = getRouteFromLocation();
  const known = new Set(["/", "/new", "/settings", "/categories", "/round", "/round-end"]);
  const route = known.has(initial) || initial.startsWith("/categories/") ? initial : "/";
  setRoute(route, { push: false });
  
  const baseAttr = document.querySelector("base")?.getAttribute("href");
  let fullPath = route;
  if (baseAttr && baseAttr !== "/") {
    fullPath = baseAttr.replace(/\/$/, "") + route;
  } else if (window.location.pathname.startsWith("/TuImpostor")) {
    fullPath = "/TuImpostor" + route;
  }
  history.replaceState({ route }, "", fullPath);
}

function setupAutoPersist(): void {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persistApp();
  });
  window.addEventListener("beforeunload", () => persistApp());
}

export async function initApp(): Promise<void> {
  store.subscribe(render); // Subscribing the root app to render on ANY state change
  await hydrateApp();
  ensureKnownInitialRoute();
  interceptLinkClicks();
  onPopState();
  setupAutoPersist();
  render();
}
