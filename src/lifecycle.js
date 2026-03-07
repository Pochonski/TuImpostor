import { store } from "./store/store.js";
import { HYDRATE_STATE } from "./store/actions.js";
import { loadPersistedState, savePersistedState, ensureCategories } from "./storage/persist.js";
import { syncFromCloud } from "./storage/sync.js";
import { ensureDefaultCategories } from "./categories/data.js";

export function hydrateApp() {
  const persisted = loadPersistedState();
  if (persisted) {
    store.dispatch({ type: HYDRATE_STATE, payload: persisted });
  }
  const state = store.getState();
  ensureCategories(state);
  ensureDefaultCategories(state);
  syncFromCloud(state);
}

export function persistApp() {
  const state = store.getState();
  savePersistedState({
    settings: state.settings,
    categories: state.categories,
    game: state.game,
  });
}
