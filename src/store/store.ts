import type { AppState, Action, Store as StoreType } from "./types.js";
import { reducer } from "./reducer.js";
import { initialState } from "./initialState.js";

class Store implements StoreType {
  state: AppState;
  reducer: (state: AppState, action: Action) => AppState;
  listeners: Set<() => void>;

  constructor(initialState: AppState, reducerFn: (state: AppState, action: Action) => AppState) {
    this.state = initialState;
    this.reducer = reducerFn;
    this.listeners = new Set();
  }

  getState(): AppState {
    return this.state;
  }

  dispatch(action: Action): void {
    const nextState = this.reducer(this.state, action);
    if (nextState !== this.state) {
      this.state = nextState;
      this.listeners.forEach((listener) => listener());
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const store = new Store(initialState, reducer);
