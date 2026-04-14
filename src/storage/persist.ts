import type { AppState } from "../store/types.js";

export const KEY = "tuimpostor:v1";

export interface PersistableState {
  settings?: Partial<AppState["settings"]>;
  categories?: AppState["categories"];
  game?: Partial<AppState["game"]>;
}

export function loadPersistedState(): PersistableState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePersistedState(persistable: PersistableState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(persistable));
  } catch {
    // ignore
  }
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function ensureCategories(state: { categories?: unknown[] }): unknown[] {
  if (!state.categories || !Array.isArray(state.categories)) {
    state.categories = [];
  }
  return state.categories;
}
