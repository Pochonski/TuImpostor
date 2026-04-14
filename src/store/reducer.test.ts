import { describe, it, expect } from "vitest";
import { reducer } from "./reducer.js";
import { initialState } from "./initialState.js";
import * as actions from "./actions.js";

describe("reducer", () => {
  it("should return initial state for unknown actions", () => {
    const state = reducer(undefined, { type: "UNKNOWN" } as never);
    expect(state).toEqual(initialState);
  });

  it("should handle SET_ROUTE", () => {
    const state = reducer(initialState, { type: actions.SET_ROUTE, payload: "/new" });
    expect(state.route).toBe("/new");
    expect(state.lastRoute).toBe("/");
  });

  it("should handle UPDATE_SETTINGS", () => {
    const state = reducer(initialState, { type: actions.UPDATE_SETTINGS, payload: { sound: false } });
    expect(state.settings.sound).toBe(false);
  });

  it("should handle SET_CATEGORIES", () => {
    const categories = [{ id: "1", name: "Test", words: ["word1"] }];
    const state = reducer(initialState, { type: actions.SET_CATEGORIES, payload: categories });
    expect(state.categories).toEqual(categories);
  });

  it("should handle ADD_CATEGORY", () => {
    const category = { id: "1", name: "Test", words: ["word1"] };
    const state = reducer(initialState, { type: actions.ADD_CATEGORY, payload: category });
    expect(state.categories).toContainEqual(category);
  });

  it("should handle UPDATE_CATEGORY", () => {
    const initial = {
      ...initialState,
      categories: [{ id: "1", name: "Old", words: ["word1"] }],
    };
    const state = reducer(initial, {
      type: actions.UPDATE_CATEGORY,
      payload: { id: "1", changes: { name: "New" } },
    });
    expect(state.categories[0].name).toBe("New");
  });

  it("should handle DELETE_CATEGORY", () => {
    const initial = {
      ...initialState,
      categories: [{ id: "1", name: "Test", words: ["word1"] }],
      game: { ...initialState.game, categoryIds: ["1"] },
    };
    const state = reducer(initial, { type: actions.DELETE_CATEGORY, payload: "1" });
    expect(state.categories).toHaveLength(0);
    expect(state.game.categoryIds).toHaveLength(0);
  });

  it("should handle UPDATE_PLAYER_COUNT", () => {
    const state = reducer(initialState, { type: actions.UPDATE_PLAYER_COUNT, payload: 5 });
    expect(state.game.playerCount).toBe(5);
    expect(state.game.playerNames).toHaveLength(5);
  });

  it("should handle UPDATE_IMPOSTOR_COUNT", () => {
    const state = reducer(initialState, { type: actions.UPDATE_IMPOSTOR_COUNT, payload: 2 });
    expect(state.game.impostorCount).toBe(2);
  });

  it("should handle UPDATE_PLAYER_NAME", () => {
    const state = reducer(initialState, {
      type: actions.UPDATE_PLAYER_NAME,
      payload: { index: 0, name: "Alice" },
    });
    expect(state.game.playerNames[0]).toBe("Alice");
  });

  it("should handle TOGGLE_CATEGORY", () => {
    const state = reducer(initialState, { type: actions.TOGGLE_CATEGORY, payload: "1" });
    expect(state.game.categoryIds).toContain("1");
    
    const state2 = reducer(state, { type: actions.TOGGLE_CATEGORY, payload: "1" });
    expect(state2.game.categoryIds).not.toContain("1");
  });

  it("should handle RESET_GAME", () => {
    const playingState = {
      ...initialState,
      game: {
        ...initialState.game,
        status: "playing" as const,
        players: [{ index: 0, label: "Player", role: "player" as const, revealed: true }],
      },
    };
    const state = reducer(playingState, { type: actions.RESET_GAME });
    expect(state.game.status).toBe("draft");
    expect(state.game.players).toHaveLength(0);
  });
});
