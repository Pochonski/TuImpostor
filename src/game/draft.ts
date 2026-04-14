import { getCategoryById } from "../categories/data.ts";
import { Category } from "../store/types.js";

export interface GameDraft {
  status: "draft";
  categoryIds: string[];
  playerCount: number;
  impostorCount: number;
  playerNames: string[];
  players: never[];
  currentWord: null;
  revealed: boolean;
  currentPlayerIndex: number;
  gamePhase: "setup";
  startShown: boolean;
}

export function createNewGameDraft(): GameDraft {
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
    gamePhase: "setup",
    startShown: false,
  };
}

interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export function validateGameDraft(state: { game: { categoryIds: string[]; playerCount: number; impostorCount: number }; categories: Category[] }): ValidationResult {
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
