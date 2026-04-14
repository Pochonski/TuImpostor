import { store } from "../store/store.js";
import { UPDATE_SETTINGS, SET_CATEGORIES, RESET_GAME } from "../store/actions.js";
import { el } from "../dom/el.js";
import { createCategory } from "../categories/actions.js";
import { getCategoriesWithDefaults } from "../categories/data.js";

interface ViewContext {
  onNavigate: (path: string) => void;
  onRefresh?: () => void;
  persist?: () => void;
}

export function viewSettings({ onNavigate, onRefresh, persist }: ViewContext) {
  const state = store.getState();
  const catList = el("div", { class: "category-list" });
  const refreshCats = () => {
    catList.innerHTML = "";
    store.getState().categories.forEach((cat) => {
      catList.append(
        el(
          "div",
          {
            class: "btn btn-category-manage",
            onclick: () => onNavigate(`/categories/${cat.id}`),
          },
          [el("span", { text: cat.name + " (" + cat.words.length + ")" })]
        )
      );
    });
  };
  refreshCats();

  const addForm = el("form", {
    class: "actions",
    onsubmit: (e: Event) => {
      e.preventDefault();
      const input = (e.target as HTMLFormElement).querySelector("input") as HTMLInputElement;
      const res = createCategory(store.getState(), input.value);
      if (res.ok) {
        store.dispatch({ type: SET_CATEGORIES, payload: res.categories });
        input.value = "";
        refreshCats();
      } else alert(res.reason);
    },
  }, [
    el("input", { type: "text", placeholder: "Nueva categoría", required: true }),
    el("button", { class: "btn btn-primary", type: "submit", text: "Añadir" }),
  ]);

  const profileSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "👤" }),
      el("h2", { text: "MI PERFIL" }),
    ]),
    el("input", {
      type: "text",
      class: "player-input",
      placeholder: "Tu apodo (ej: Juanito)",
      value: state.settings.nickname || "",
      oninput: (e: Event) => {
        store.dispatch({ type: UPDATE_SETTINGS, payload: { nickname: (e.target as HTMLInputElement).value }});
        localStorage.setItem("tuimpostor:nickname", (e.target as HTMLInputElement).value);
      },
    }),
    el("p", {
      class: "small",
      style: "margin-top:4px",
      text: "Este nombre aparecerá junto a las palabras que crees.",
    }),
  ]);

  const content = el("div", {}, [
    profileSection,
    el("h2", { class: "h2", style: "margin-top:20px", text: "Categorías Globales" }),
    catList,
    addForm,
    el("div", { class: "actions", style: "margin-top:20px" }, [
      el("button", {
        class: "btn btn-secondary",
        style: "border-color: var(--accent); color: var(--accent)",
        onclick: () => {
          if (
            confirm("¿Restaurar categorías predeterminadas? No se borrarán las que hayas creado.")
          ) {
            const newCats = getCategoriesWithDefaults(store.getState().categories);
            store.dispatch({ type: SET_CATEGORIES, payload: newCats });
            if (persist) persist();
            if (onRefresh) onRefresh();
          }
        },
      }, ["Restaurar categorías básicas"]),
      el("button", {
        class: "btn btn-primary",
        onclick: () => {
          store.dispatch({ type: RESET_GAME });
          onNavigate("/");
        },
      }, ["Nueva partida"]),
      el("button", { class: "btn btn-secondary", onclick: () => onNavigate("/") }, ["Volver"]),
    ]),
  ]);

  return { title: "Ajustes", subtitle: "Comunidad", content };
}
