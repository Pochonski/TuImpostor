import { state } from "./state.js";
import { loadPersistedState, savePersistedState, ensureCategories } from "./storage.js";
import { ensureDefaultCategories } from "./categories.js";
import { createNewGameDraft } from "./game.js";
import { renderApp } from "./ui.js";

function normalizeRoute(pathname) {
  if (!pathname) return "/";
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean;
}

function getRouteFromLocation() {
  const url = new URL(window.location.href);
  return normalizeRoute(url.pathname);
}

function setRoute(route, { push = true } = {}) {
  const next = normalizeRoute(route);
  if (state.route === next) return;

  state.lastRoute = state.route;
  state.route = next;

  if (push) {
    history.pushState({ route: next }, "", next);
  }

  render();
}

function render() {
  const root = document.getElementById("app");
  if (!root) return;

  renderApp(root, state.route, {
    onNavigate: (to) => setRoute(to, { push: true }),
  });
}

function hydrate() {
  const persisted = loadPersistedState();
  if (persisted?.settings) {
    state.settings = { ...state.settings, ...persisted.settings };
  }
  if (persisted?.categories) {
    state.categories = persisted.categories;
  }
  if (persisted?.game) {
    state.game = { ...createNewGameDraft(), ...persisted.game };
    // Forzar gamePhase a setup si está en ready para evitar bucles
    if (state.game.gamePhase === "ready") {
      state.game.gamePhase = "setup";
    }
  }
  ensureCategories(state);
  ensureDefaultCategories(state);
}

function persist() {
  savePersistedState({
    settings: state.settings,
    categories: state.categories,
    game: state.game,
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
  window.addEventListener("popstate", (ev) => {
    const route = ev.state?.route ?? getRouteFromLocation();
    state.route = normalizeRoute(route);
    render();
  });
}

function ensureKnownInitialRoute() {
  const initial = getRouteFromLocation();
  const known = new Set(["/", "/new", "/settings", "/categories", "/play", "/round"]);
  state.route = known.has(initial) ? initial : "/";
  history.replaceState({ route: state.route }, "", state.route);
}

function setupAutoPersist() {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persist();
  });
  window.addEventListener("beforeunload", () => persist());
}

export function initApp() {
  hydrate();
  ensureKnownInitialRoute();
  interceptLinkClicks();
  onPopState();
  setupAutoPersist();
  render();
}

initApp();
