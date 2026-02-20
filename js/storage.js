const KEY = "tuimpostor:v1";

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePersistedState(persistable) {
  try {
    localStorage.setItem(KEY, JSON.stringify(persistable));
  } catch {
    // ignore
  }
}

export function clearPersistedState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function ensureCategories(state) {
  if (!state.categories || !Array.isArray(state.categories)) {
    state.categories = [];
  }
  return state.categories;
}
