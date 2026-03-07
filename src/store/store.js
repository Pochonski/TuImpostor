import { reducer } from "./reducer.js";
import { initialState } from "./initialState.js";

class Store {
  constructor(initialState, reducer) {
    this.state = initialState;
    this.reducer = reducer;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  dispatch(action) {
    const nextState = this.reducer(this.state, action);
    if (nextState !== this.state) {
      this.state = nextState;
      this.listeners.forEach((listener) => listener());
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const store = new Store(initialState, reducer);
