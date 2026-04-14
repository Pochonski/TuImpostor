import { store } from "../store/store.js";
import { el } from "../dom/el.js";
import { addWord } from "../categories/actions.js";
import { viewNotFound } from "./notFound.js";
import type { Category } from "../store/types.js";

interface ViewContext {
  onNavigate: (path: string) => void;
}

export function viewCategoryDetail({ categoryId, onNavigate }: { categoryId: string } & ViewContext) {
  const state = store.getState();
  const cat = state.categories.find((c) => c.id === categoryId);
  if (!cat) return viewNotFound({ onNavigate });

  const wordList = el("div", { class: "player-list" });
  const refreshWords = () => {
    wordList.innerHTML = "";
    cat.words.forEach((wordObj) => {
      const text = typeof wordObj === "string" ? wordObj : (wordObj as { text?: string }).text || String(wordObj);
      const author = typeof wordObj === "string" ? "Sistema" : (wordObj as { author?: string }).author || "Anónimo";
      const item = el("div", {
        class: "btn btn-player",
        style: "pointer-events:none; justify-content: space-between;",
      }, [
        el("span", { text }),
        el("span", {
          style: "font-size: 10px; opacity: 0.5; font-style: italic;",
          text: `por ${author}`,
        }),
      ]);
      wordList.append(item);
    });
  };
  refreshWords();

  const addWordForm = el("form", {
    class: "actions",
    onsubmit: (e: Event) => {
      e.preventDefault();
      const input = (e.target as HTMLFormElement).querySelector("input") as HTMLInputElement;
      const res = addWord({ categories: state.categories, settings: state.settings }, categoryId, input.value);
      if (res.ok) {
        if (res.categories) {
          store.dispatch({ type: "SET_CATEGORIES" as never, payload: res.categories });
        }
        input.value = "";
        refreshWords();
      }
    },
  }, [
    el("input", { type: "text", placeholder: "Nueva palabra", required: true }),
    el("button", { class: "btn btn-primary", type: "submit", text: "Añadir Palabra" }),
  ]);

  const content = el("div", {}, [
    el("h2", { class: "h2", text: cat.name }),
    el("p", { class: "p", text: "Estas palabras se sincronizan para todos los jugadores." }),
    wordList,
    addWordForm,
    el("button", {
      class: "btn btn-secondary",
      style: "margin-top:20px",
      onclick: () => onNavigate("/settings"),
    }, ["Ajustes"]),
  ]);

  return { title: cat.name, subtitle: "Palabras", content };
}
