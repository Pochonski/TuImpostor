import { getCategoryById } from "./data.js";
import { syncToCloud } from "../storage/sync.js";

export function createCategory(state, name) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, reason: "Nombre vacío" };
  if (state.categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, reason: "Ya existe esa categoría" };
  }
  const newCat = {
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: trimmed,
    words: [],
    author: state.settings.nickname || "Anónimo",
  };
  syncToCloud(newCat);
  return { ok: true, categories: [...state.categories, newCat] };
}

export function addWord(state, categoryId, word) {
  const trimmed = word.trim();
  if (!trimmed) return { ok: false, reason: "Palabra vacía" };
  const cat = getCategoryById(state, categoryId);
  if (!cat) return { ok: false, reason: "Categoría no encontrada" };
  const alreadyExists = cat.words.some((w) => {
    const text = typeof w === "string" ? w : w.text;
    return text.toLowerCase() === trimmed.toLowerCase();
  });
  if (alreadyExists) return { ok: true };
  
  const updatedWords = [...cat.words, {
    text: trimmed,
    author: state.settings.nickname || "Anónimo",
  }];
  
  syncToCloud({ ...cat, words: updatedWords });
  return { ok: true, categoryChanges: { words: updatedWords } };
}
