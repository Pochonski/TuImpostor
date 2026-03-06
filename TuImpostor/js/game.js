import { getCategoryById } from "./categories.js";

export function createNewGameDraft() {
  return {
    status: "draft",
    categoryIds: [],
    playerCount: 3,
    impostorCount: 1,
    playerNames: [],
    players: [],
    currentWord: null,
    revealed: false,
    currentPlayerIndex: 0,
    gamePhase: "setup", // setup, playing, start, voting, reveal
    startShown: false,
  };
}

export function votePlayer(state, playerIndex) {
  const player = state.game.players[playerIndex];
  if (!player) return { ok: false, error: "Jugador no encontrado" };
  
  // Inicializar array de jugadores votados si no existe
  if (!state.game.votedPlayers) {
    state.game.votedPlayers = [];
  }
  
  // Agregar jugador a la lista de votados si no está ya
  if (!state.game.votedPlayers.includes(playerIndex)) {
    state.game.votedPlayers.push(playerIndex);
  }
  
  state.game.votedPlayer = player;
  state.game.gamePhase = "vote-result";
  
  return { ok: true, isImpostor: player.role === "impostor" };
}

export function validateGameDraft(state) {
  const { categoryIds, playerCount, impostorCount } = state.game;
  if (!categoryIds || !categoryIds.length) return { ok: false, reason: "Selecciona al menos una categoría" };
  const totalWords = categoryIds.reduce((sum, id) => {
    const cat = getCategoryById(state, id);
    return sum + (cat?.words?.length ?? 0);
  }, 0);
  if (totalWords < 3) return { ok: false, reason: "Las categorías seleccionadas deben tener al menos 3 palabras en total" };
  if (playerCount < 3) return { ok: false, reason: "Debe haber al menos 3 jugadores" };
  if (impostorCount < 1) return { ok: false, reason: "Debe haber al menos 1 impostor" };
  if (impostorCount >= playerCount) return { ok: false, reason: "Debe haber menos impostores que jugadores" };
  return { ok: true };
}

function shuffleArray(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickRandomWord(state) {
  const { categoryIds } = state.game;
  const allWords = [];
  for (const id of categoryIds) {
    const cat = getCategoryById(state, id);
    if (cat?.words?.length) allWords.push(...cat.words);
  }
  if (!allWords.length) return null;
  const idx = Math.floor(Math.random() * allWords.length);
  return allWords[idx];
}

function assignRoles(playerCount, impostorCount) {
  const roles = Array(playerCount).fill("crew");
  const impostorIndices = shuffleArray(Array.from({ length: playerCount }, (_, i) => i)).slice(0, impostorCount);
  for (const i of impostorIndices) roles[i] = "impostor";
  return roles;
}

export function startGame(state) {
  const valid = validateGameDraft(state);
  if (!valid.ok) return valid;

  const { playerCount, impostorCount } = state.game;
  const word = pickRandomWord(state);
  if (!word) return { ok: false, reason: "No se pudo elegir una palabra" };

  const roles = assignRoles(playerCount, impostorCount);
  const players = roles.map((role, idx) => ({
    index: idx,
    label: state.game.playerNames[idx] || `Jugador ${idx + 1}`,
    role,
    revealed: false,
  }));

  state.game.status = "playing";
  state.game.players = players;
  state.game.currentWord = word;
  state.game.revealed = false;
  state.game.currentPlayerIndex = 0;
  // Ir directamente a la fase de juego, omitir "ready"
  state.game.gamePhase = "playing";
  state.game.startShown = true;
  // Limpiar lista de jugadores votados para nueva partida
  state.game.votedPlayers = [];

  return { ok: true, word };
}

export function revealCurrentPlayer(state) {
  const player = state.game.players[state.game.currentPlayerIndex];
  if (!player) return { ok: false, reason: "No hay jugador actual" };
  player.revealed = true;
  state.game.revealed = true;
  return { ok: true, player };
}

export function nextPlayer(state) {
  const nextIdx = state.game.currentPlayerIndex + 1;
  if (nextIdx >= state.game.players.length) {
    // Todos los jugadores han pasado - mantener en "playing" para mostrar botón de revelar
    state.game.currentPlayerIndex = state.game.players.length - 1; // Mantener en último jugador
    return { ok: true, finished: true };
  }
  state.game.currentPlayerIndex = nextIdx;
  state.game.revealed = false;
  return { ok: true, finished: false };
}

export function startGamePhase(state) {
  state.game.gamePhase = "playing";
  state.game.currentPlayerIndex = 0;
  state.game.revealed = false;
  state.game.startShown = true; // No mostrar la pantalla de quién comienza
  return { ok: true };
}

export function revealImpostors(state) {
  state.game.gamePhase = "reveal";
  return { ok: true };
}

export function resetGame(state) {
  // Guardar configuración que queremos mantener
  const savedConfig = {
    playerCount: state.game.playerCount,
    impostorCount: state.game.impostorCount,
    playerNames: state.game.playerNames,
    categoryIds: state.game.categoryIds
  };
  
  // Crear nuevo borrador pero restaurar la configuración guardada
  state.game = { ...createNewGameDraft(), ...savedConfig };
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  return { ok: true };
}
import { getCategoryById } from "./categories.js";

export function createNewGameDraft() {
  return {
    status: "draft",
    categoryIds: [],
    playerCount: 3,
    impostorCount: 1,
    playerNames: [],
    players: [],
    currentWord: null,
    revealed: false,
    currentPlayerIndex: 0,
    gamePhase: "setup", // setup, playing, start, voting, reveal
    startShown: false,
  };
}

export function votePlayer(state, playerIndex) {
  const player = state.game.players[playerIndex];
  if (!player) return { ok: false, error: "Jugador no encontrado" };
  
  // Inicializar array de jugadores votados si no existe
  if (!state.game.votedPlayers) {
    state.game.votedPlayers = [];
  }
  
  // Agregar jugador a la lista de votados si no está ya
  if (!state.game.votedPlayers.includes(playerIndex)) {
    state.game.votedPlayers.push(playerIndex);
  }
  
  state.game.votedPlayer = player;
  state.game.gamePhase = "vote-result";
  
  return { ok: true, isImpostor: player.role === "impostor" };
}

export function validateGameDraft(state) {
  const { categoryIds, playerCount, impostorCount } = state.game;
  if (!categoryIds || !categoryIds.length) return { ok: false, reason: "Selecciona al menos una categoría" };
  const totalWords = categoryIds.reduce((sum, id) => {
    const cat = getCategoryById(state, id);
    return sum + (cat?.words?.length ?? 0);
  }, 0);
  if (totalWords < 3) return { ok: false, reason: "Las categorías seleccionadas deben tener al menos 3 palabras en total" };
  if (playerCount < 3) return { ok: false, reason: "Debe haber al menos 3 jugadores" };
  if (impostorCount < 1) return { ok: false, reason: "Debe haber al menos 1 impostor" };
  if (impostorCount >= playerCount) return { ok: false, reason: "Debe haber menos impostores que jugadores" };
  return { ok: true };
}

function shuffleArray(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickRandomWord(state) {
  const { categoryIds } = state.game;
  const allWords = [];
  for (const id of categoryIds) {
    const cat = getCategoryById(state, id);
    if (cat?.words?.length) allWords.push(...cat.words);
  }
  if (!allWords.length) return null;
  const idx = Math.floor(Math.random() * allWords.length);
  return allWords[idx];
}

function assignRoles(playerCount, impostorCount) {
  const roles = Array(playerCount).fill("crew");
  const impostorIndices = shuffleArray(Array.from({ length: playerCount }, (_, i) => i)).slice(0, impostorCount);
  for (const i of impostorIndices) roles[i] = "impostor";
  return roles;
}

export function startGame(state) {
  const valid = validateGameDraft(state);
  if (!valid.ok) return valid;

  const { playerCount, impostorCount } = state.game;
  const word = pickRandomWord(state);
  if (!word) return { ok: false, reason: "No se pudo elegir una palabra" };

  const roles = assignRoles(playerCount, impostorCount);
  const players = roles.map((role, idx) => ({
    index: idx,
    label: state.game.playerNames[idx] || `Jugador ${idx + 1}`,
    role,
    revealed: false,
  }));

  state.game.status = "playing";
  state.game.players = players;
  state.game.currentWord = word;
  state.game.revealed = false;
  state.game.currentPlayerIndex = 0;
  // Ir directamente a la fase de juego, omitir "ready"
  state.game.gamePhase = "playing";
  state.game.startShown = false;
  state.game.startShown = true;
  state.game.startShown = true;
  state.game.startShown = true;
  state.game.startShown = true;
  state.game.startShown = true;
  state.game.startShown = true;
  state.game.startShown = true;
  state.game.startShown = true;
  state.game.startShown = true;
  state.game.startShown = true;
  // Limpiar lista de jugadores votados para nueva partida
  state.game.votedPlayers = [];
  state.game.startShown = true;
  // Limpiar lista de jugadores votados para nueva partida
  state.game.votedPlayers = [];
  state.game.startShown = true;
  // Limpiar lista de jugadores votados para nueva partida
  state.game.votedPlayers = [];
  state.game.startShown = true;
  // Limpiar lista de jugadores votados para nueva partida
  state.game.votedPlayers = [];
  state.game.startShown = true;
  // Limpiar lista de jugadores votados para nueva partida
  state.game.votedPlayers = [];
  state.game.startShown = true;
  // Limpiar lista de jugadores votados para nueva partida
  state.game.votedPlayers = [];
  state.game.startShown = true;
  // Limpiar lista de jugadores votados para nueva partida
  state.game.votedPlayers = [];

  return { ok: true, word };
}

export function revealCurrentPlayer(state) {
  const player = state.game.players[state.game.currentPlayerIndex];
  if (!player) return { ok: false, reason: "No hay jugador actual" };
  player.revealed = true;
  state.game.revealed = true;
  return { ok: true, player };
}

export function nextPlayer(state) {
  const nextIdx = state.game.currentPlayerIndex + 1;
  if (nextIdx >= state.game.players.length) {
    // Todos los jugadores han pasado - mantener en "playing" para mostrar botón de revelar
    state.game.currentPlayerIndex = state.game.players.length - 1; // Mantener en último jugador
    return { ok: true, finished: true };
  }
  state.game.currentPlayerIndex = nextIdx;
  state.game.revealed = false;
  return { ok: true, finished: false };
}

export function startGamePhase(state) {
  state.game.gamePhase = "playing";
  state.game.currentPlayerIndex = 0;
  state.game.revealed = false;
  state.game.startShown = true; // No mostrar la pantalla de quién comienza
  return { ok: true };
}

export function revealImpostors(state) {
  state.game.gamePhase = "reveal";
  return { ok: true };
}

export function resetGame(state) {
  // Guardar configuración que queremos mantener
  const savedConfig = {
    playerCount: state.game.playerCount,
    impostorCount: state.game.impostorCount,
    playerNames: state.game.playerNames,
    categoryIds: state.game.categoryIds
  };
  
  // Crear nuevo borrador pero restaurar la configuración guardada
  state.game = { ...createNewGameDraft(), ...savedConfig };
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  // Limpiar lista de jugadores votados
  state.game.votedPlayers = [];
  return { ok: true };
}
