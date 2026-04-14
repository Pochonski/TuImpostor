import { store } from "./store/store.js";
import { HYDRATE_STATE } from "./store/actions.js";
import { loadPersistedState, savePersistedState, ensureCategories } from "./storage/persist.js";
import { syncFromCloud } from "./storage/sync.js";
import { ensureDefaultCategories } from "./categories/data.js";
import type { AppState } from "./store/types.js";

export async function hydrateApp(): Promise<void> {
  const persisted = loadPersistedState();
  if (persisted) {
    store.dispatch({ type: HYDRATE_STATE, payload: persisted });
  }
  const state = store.getState();
  ensureCategories(state);
  ensureDefaultCategories(state);
  await syncFromCloud(state);
}

export function persistApp(): void {
  const state = store.getState();
  savePersistedState({
    settings: state.settings,
    categories: state.categories,
    game: state.game,
  });
}
