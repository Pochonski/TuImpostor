const nickname = typeof localStorage !== "undefined" ? localStorage.getItem("tuimpostor:nickname") || "" : "";

export const initialState = {
  route: "/",
  lastRoute: null,
  ui: {
    busy: false,
    toast: null,
  },
  settings: {
    sound: true,
    haptics: true,
    nickname,
  },
  categories: [],
  game: {
    status: "idle",
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
  },
};
