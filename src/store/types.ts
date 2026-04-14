// Game State Types
export type GameStatus = "draft" | "playing" | "finished";
export type GamePhase = "setup" | "start" | "playing" | "vote" | "vote-result" | "reveal" | "result";
export type PlayerRole = "impostor" | "player";

// Player
export interface Player {
  index: number;
  label: string;
  role: PlayerRole;
  revealed: boolean;
}

// Settings
export interface Settings {
  sound: boolean;
  vibration: boolean;
  darkMode: boolean;
  language: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  words: string[];
}

// Game
export interface Game {
  status: GameStatus;
  playerCount: number;
  impostorCount: number;
  playerNames: string[];
  categoryIds: string[];
  players: Player[];
  currentWord: string | null;
  revealed: boolean;
  currentPlayerIndex: number;
  gamePhase: GamePhase;
  startShown: boolean;
  votedPlayers: number[];
  votedPlayer: Player | null;
}

// App State
export interface AppState {
  route: string;
  lastRoute: string;
  settings: Settings;
  categories: Category[];
  game: Game;
}

// Action Types
export type Action =
  | { type: "SET_ROUTE"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> }
  | { type: "SET_CATEGORIES"; payload: Category[] }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: { id: string; changes: Partial<Category> } }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "SET_GAME_DRAFT"; payload: Partial<Game> }
  | { type: "UPDATE_PLAYER_COUNT"; payload: number }
  | { type: "UPDATE_IMPOSTOR_COUNT"; payload: number }
  | { type: "UPDATE_PLAYER_NAME"; payload: { index: number; name: string } }
  | { type: "TOGGLE_CATEGORY"; payload: string }
  | { type: "START_GAME"; payload: { word: string } }
  | { type: "REVEAL_CURRENT_PLAYER" }
  | { type: "FINISH_REVEAL_PHASE" }
  | { type: "SET_GAME_PHASE"; payload: GamePhase }
  | { type: "NEXT_PLAYER" }
  | { type: "VOTE_PLAYER"; payload: number }
  | { type: "REVEAL_IMPOSTORS" }
  | { type: "RESET_GAME" }
  | { type: "HYDRATE_STATE"; payload: Partial<AppState> };

// Reducer Type
export type Reducer = (state: AppState, action: Action) => AppState;

// Store Type
export interface Store {
  getState(): AppState;
  dispatch(action: Action): void;
  subscribe(listener: () => void): () => void;
}
