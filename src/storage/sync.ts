import { db, collection, getDocs, doc, setDoc, deleteDoc } from "../config.js";
import { setSyncStatus } from "../ui.js";
import { store } from "../store/store.js";
import { ADD_CATEGORY, UPDATE_CATEGORY } from "../store/actions.js";
import type { AppState } from "../store/types.js";

export async function syncFromCloud(state: AppState): Promise<void> {
  if (!db) return;
  try {
    setSyncStatus("Sincronizando...", "syncing");
    const catsCol = collection(db, "categories");
    const snapshot = await getDocs(catsCol);
    const cloudCats = snapshot.docs.map((d: { id: string; data: () => Record<string, unknown> }) => ({ id: d.id, ...d.data() }));
    
    if (cloudCats) {
      cloudCats.forEach((cloudCat: { id: string; words?: unknown[] }) => {
        const local = state.categories.find((c) => c.id === cloudCat.id);
        if (!local) {
          store.dispatch({ type: ADD_CATEGORY, payload: cloudCat });
        } else {
          const cloudWords = Array.isArray(cloudCat.words) ? cloudCat.words : [];
          const localWords = Array.isArray(local.words) ? local.words : [];
          const wordsMap = new Map<string, unknown>();
          localWords.forEach((w: unknown) => {
            const key = typeof w === "string" ? w.toLowerCase() : (w as { text: string }).text.toLowerCase();
            wordsMap.set(key, typeof w === "string" ? { text: w, author: "Sistema" } : w);
          });
          cloudWords.forEach((w: unknown) => {
            const key = typeof w === "string" ? w.toLowerCase() : (w as { text: string }).text.toLowerCase();
            if (!wordsMap.has(key)) {
              wordsMap.set(key, typeof w === "string" ? { text: w, author: "Gente" } : w);
            }
          });
          store.dispatch({
            type: UPDATE_CATEGORY,
            payload: { id: local.id, changes: { words: Array.from(wordsMap.values()) } }
          });
        }
      });
    }
    setSyncStatus("Online", "online");
  } catch (err) {
    console.warn("Cloud sync error:", err);
    setSyncStatus("Offline", "error");
  }
}

export async function syncToCloud(category: { id: string; name: string; words: unknown[]; author?: string }): Promise<void> {
  if (!db) return;
  try {
    const catDoc = doc(db, "categories", category.id);
    await setDoc(catDoc, {
      id: category.id,
      name: category.name,
      words: category.words,
      author: category.author || "Anónimo",
      updatedAt: new Date(),
    });
  } catch (err) {
    console.warn("Push error (offline):", err);
  }
}

export async function deleteFromCloud(categoryId: string): Promise<void> {
  if (!db) return;
  try {
    const catDoc = doc(db, "categories", categoryId);
    await deleteDoc(catDoc);
  } catch (err) {
    console.warn("Delete error:", err);
  }
}
