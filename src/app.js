import { store } from "./store/store.js";
import { HYDRATE_STATE } from "./store/actions.js";
import { renderApp, setRoute, getRouteFromLocation, normalizeRoute, registerRender } from "./router.js";
import { hydrateApp as hydrate, persistApp as persist } from "./lifecycle.js";

export function render() {
  const root = document.getElementById("app");
  if (!root) return;
  const state = store.getState();
  renderApp(root, state.route, {
    onNavigate: (to) => setRoute(to, { push: true }),
    onRefresh: render,
    persist,
  });
}

function interceptLinkClicks() {
  document.addEventListener("click", (ev) => {
    const a = ev.target?.closest?.("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("/")) return;
    ev.preventDefault();
    setRoute(href, { push: true });
  });
}

function onPopState() {
  window.addEventListener("popstate", () => {
    const route = history.state?.route ?? getRouteFromLocation();
    setRoute(normalizeRoute(route), { push: false });
  });
}

function ensureKnownInitialRoute() {
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

function setupAutoPersist() {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persist();
  });
  window.addEventListener("beforeunload", () => persist());
}

export async function initApp() {
  store.subscribe(render); // Subscribing the root app to render on ANY state change
  await hydrate();
  ensureKnownInitialRoute();
  interceptLinkClicks();
  onPopState();
  setupAutoPersist();
  render();
}
