import { supabaseClient } from "../config.js";
import { setSyncStatus } from "../ui.js";

export async function syncFromCloud(state) {
  if (!supabaseClient) return;
  try {
    setSyncStatus("Sincronizando...", "syncing");
    const { data: cloudCats, error } = await supabaseClient.from("categories").select("*");
    if (error) throw error;
    if (cloudCats) {
      cloudCats.forEach((cloudCat) => {
        const local = state.categories.find((c) => c.id === cloudCat.id);
        if (!local) {
          state.categories.push(cloudCat);
        } else {
          const cloudWords = Array.isArray(cloudCat.words) ? cloudCat.words : [];
          const localWords = Array.isArray(local.words) ? local.words : [];
          const wordsMap = new Map();
          localWords.forEach((w) => {
            const key = typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase();
            wordsMap.set(key, typeof w === "string" ? { text: w, author: "Sistema" } : w);
          });
          cloudWords.forEach((w) => {
            const key = typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase();
            if (!wordsMap.has(key)) {
              wordsMap.set(key, typeof w === "string" ? { text: w, author: "Gente" } : w);
            }
          });
          local.words = Array.from(wordsMap.values());
        }
      });
    }
    setSyncStatus("Online", "online");
  } catch (err) {
    console.warn("Cloud sync error:", err);
    setSyncStatus("Offline", "error");
  }
}

export async function syncToCloud(category) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from("categories").upsert(
      {
        id: category.id,
        name: category.name,
        words: category.words,
        author: category.author || "Anónimo",
        updated_at: new Date(),
      },
      { onConflict: "id" }
    );
  } catch (err) {
    console.warn("Push error (offline):", err);
  }
}
