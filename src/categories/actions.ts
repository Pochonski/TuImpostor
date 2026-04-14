import { Category } from "../store/types.js";

export const SET_CATEGORIES = "SET_CATEGORIES";
export const ADD_CATEGORY = "ADD_CATEGORY";
export const UPDATE_CATEGORY = "UPDATE_CATEGORY";
export const DELETE_CATEGORY = "DELETE_CATEGORY";

export function createCategory(
  state: { categories: Category[] },
  name: string
): { ok: boolean; categories?: Category[]; reason?: string } {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, reason: "El nombre no puede estar vacío" };
  const id = trimmed.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const exists = state.categories.some(
    (c) => c.id === id || c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) return { ok: false, reason: "Ya existe una categoría con ese nombre" };
  return { ok: true, categories: [...state.categories, { id, name: trimmed, words: [] }] };
}

export function addCategory(state: { categories: Category[] }, newCategory: Category): Category[] {
  const existingIndex = state.categories.findIndex((c) => c.id === newCategory.id);
  if (existingIndex !== -1) {
    const updated = [...state.categories];
    updated[existingIndex] = { ...updated[existingIndex], ...newCategory };
    return updated;
  }
  return [...state.categories, newCategory];
}

export function updateCategory(
  state: { categories: Category[] },
  categoryId: string,
  changes: Partial<Category>
): Category[] {
  return state.categories.map((cat) =>
    cat.id === categoryId ? { ...cat, ...changes } : cat
  );
}

export function deleteCategory(state: { categories: Category[] }, categoryId: string): Category[] {
  return state.categories.filter((cat) => cat.id !== categoryId);
}

export function addWord(
  state: { categories: Category[]; settings: { nickname?: string } },
  categoryId: string,
  word: string
): { ok: boolean; categories?: Category[]; reason?: string } {
  const trimmed = word.trim();
  if (!trimmed) return { ok: false, reason: "La palabra no puede estar vacía" };
  const cat = state.categories.find((c) => c.id === categoryId);
  if (!cat) return { ok: false, reason: "Categoría no encontrada" };
  const exists = cat.words.some((w) => typeof w === "string" ? w.toLowerCase() === trimmed.toLowerCase() : w.text.toLowerCase() === trimmed.toLowerCase());
  if (exists) return { ok: false, reason: "Esta palabra ya existe en la categoría" };
  const author = state.settings?.nickname || "Anónimo";
  const newWord = typeof cat.words[0] === "object" ? { text: trimmed, author } : trimmed;
  const updatedCategories = state.categories.map((c) =>
    c.id === categoryId ? { ...c, words: [...c.words, newWord] } : c
  );
  return { ok: true, categories: updatedCategories };
}
