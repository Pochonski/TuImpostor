import type { AppState, Game, Settings } from "./types.js";

export const initialSettings: Settings = {
  sound: true,
  vibration: true,
  darkMode: true,
  language: "es",
};

export const initialGame: Game = {
  status: "draft",
  categoryIds: [],
  playerCount: 3,
  impostorCount: 1,
  playerNames: [],
  players: [],
  currentWord: null,
  revealed: false,
  currentPlayerIndex: 0,
  gamePhase: "setup",
  startShown: false,
  votedPlayers: [],
  votedPlayer: null,
};

export const initialState: AppState = {
  route: "/",
  lastRoute: "",
  settings: initialSettings,
  categories: [],
  game: initialGame,
};
