import { getCategoryById } from "../categories/data.js";

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
    gamePhase: "setup",
    startShown: false,
  };
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
