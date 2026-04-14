import { store } from "./store/store.js";
import { SET_ROUTE } from "./store/actions.js";
import { screenShell, makeNav } from "./dom/el.js";
import { viewNewGame } from "./views/newGame.js";
import { viewSettings } from "./views/settings.js";
import { viewRound } from "./views/round.js";
import { viewCategoryDetail } from "./views/categoryDetail.js";
import { viewNotFound } from "./views/notFound.js";

interface RenderContext {
  onNavigate: (path: string) => void;
  onRefresh?: () => void;
  persist?: () => void;
}

export function normalizeRoute(pathname: string): string {
  if (!pathname) return "/";
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean;
}

export function getRouteFromLocation(): string {
  const url = new URL(window.location.href);
  const baseAttr = document.querySelector("base")?.getAttribute("href");
  let pathname = url.pathname;
  if (baseAttr && baseAttr !== "/" && pathname.startsWith(baseAttr)) {
    pathname = pathname.substring(baseAttr.length - 1);
  } else if (pathname.startsWith("/TuImpostor")) {
    pathname = pathname.substring("/TuImpostor".length);
  }
  return normalizeRoute(pathname || "/");
}

let renderCallback: (() => void) | null = null;

export function registerRender(fn: () => void): void {
  renderCallback = fn;
}

export function setRoute(route: string, { push = true }: { push?: boolean } = {}): void {
  const next = normalizeRoute(route);
  const routeState = store.getState().route;
  if (routeState === next) return;
  store.dispatch({ type: SET_ROUTE, payload: next });
  if (push) {
    const baseAttr = document.querySelector("base")?.getAttribute("href");
    let fullPath = next;
    if (baseAttr && baseAttr !== "/") {
      const cleanBase = baseAttr.replace(/\/$/, "");
      fullPath = cleanBase + next;
    } else if (typeof window !== "undefined" && window.location.pathname.startsWith("/TuImpostor")) {
      fullPath = "/TuImpostor" + next;
    }
    history.pushState({ route: next }, "", fullPath);
  }
  if (renderCallback) renderCallback();
}

interface CategoryDetailContext {
  categoryId: string;
  onNavigate: (path: string) => void;
}

export function getViewModel(route: string, ctx: RenderContext) {
  const { onNavigate, onRefresh, persist } = ctx;
  const routes: Record<string, (ctx: RenderContext) => ReturnType<typeof viewNewGame>> = {
    "/": viewNewGame,
    "/new": viewNewGame,
    "/settings": viewSettings,
    "/round": viewRound,
    "/round-end": viewRound,
  };
  const dynamicMatch = /^\/categories\/([^/]+)$/.exec(route);
  if (dynamicMatch) {
    return viewCategoryDetail({ categoryId: dynamicMatch[1], onNavigate });
  } else {
    const view = routes[route] || viewNotFound;
    return view({ onNavigate, onRefresh, persist });
  }
}

export function renderApp(root: HTMLElement, route: string, ctx: RenderContext): void {
  const model = getViewModel(route, ctx);
  const nav = makeNav(route, ctx.onNavigate);
  const shell = screenShell({
    title: model.title,
    subtitle: model.subtitle,
    content: model.content,
    nav,
  });
  root.innerHTML = "";
  root.append(shell);
}
