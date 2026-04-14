import { store } from "../store/store.js";
import { UPDATE_PLAYER_COUNT, UPDATE_IMPOSTOR_COUNT, UPDATE_PLAYER_NAME, TOGGLE_CATEGORY, START_GAME } from "../store/actions.js";
import { el } from "../dom/el.js";
import { validateGameDraft } from "../game/draft.js";

interface ViewContext {
  onNavigate: (path: string) => void;
  onRefresh?: () => void;
}

export function viewNewGame({ onNavigate }: ViewContext) {
  const state = store.getState();
  const cats = state.categories;
  if (!state.game.playerNames || state.game.playerNames.length === 0) {
    store.dispatch({ type: UPDATE_PLAYER_COUNT, payload: state.game.playerCount });
  }

  const playersSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "🎮" }),
      el("h2", { class: "section-title", text: "MODO DE JUEGO" }),
    ]),
    el("div", { class: "section-header" }, [
      el("span", { text: "🖐" }),
      el("h2", { class: "section-title", text: "JUGADORES" }),
    ]),
    el("div", { class: "player-count-control" }, [
      el("button", {
        class: "btn btn-count-control",
        type: "button",
        text: "−",
        onclick: () => {
          const v = parseInt((playerCount as HTMLInputElement).value, 10);
          if (v > 3) {
            store.dispatch({ type: UPDATE_PLAYER_COUNT, payload: v - 1 });
            (playerCount as HTMLInputElement).value = String(v - 1);
            updatePlayerButtons();
          }
        },
      }),
      el("input", {
        class: "player-input",
        type: "number",
        min: 3,
        max: 20,
        value: state.game.playerCount,
        onchange: () => {
          const v = parseInt((playerCount as HTMLInputElement).value, 10);
          if (v >= 3 && v <= 20) {
            store.dispatch({ type: UPDATE_PLAYER_COUNT, payload: v });
          }
          updatePlayerButtons();
        },
      }),
      el("button", {
        class: "btn btn-count-control",
        type: "button",
        text: "+",
        onclick: () => {
          const v = parseInt((playerCount as HTMLInputElement).value, 10);
          if (v < 20) {
            store.dispatch({ type: UPDATE_PLAYER_COUNT, payload: v + 1 });
            (playerCount as HTMLInputElement).value = String(v + 1);
            updatePlayerButtons();
          }
        },
      }),
    ]),
    el("div", { class: "player-buttons" }),
  ]);

  const playerCount = playersSection.querySelector('input[type="number"]') as HTMLInputElement;
  const playerButtons = playersSection.querySelector(".player-buttons") as HTMLElement;

  const updatePlayerButtons = () => {
    playerButtons.innerHTML = "";
    for (let i = 0; i < state.game.playerCount; i++) {
      const playerNameInput = el("input", {
        class: "player-input",
        type: "text",
        value: state.game.playerNames[i] || `Jugador ${i + 1}`,
        placeholder: `Jugador ${i + 1}`,
        onchange: (e: Event) => {
          store.dispatch({
            type: UPDATE_PLAYER_NAME,
            payload: { index: i, name: (e.target as HTMLInputElement).value || `Jugador ${i + 1}` },
          });
        },
      });
      const playerInputContainer = el("div", { class: "player-input-container" }, [
        playerNameInput,
        el("span", { class: "edit-icon" }, ["✏️"]),
      ]);
      playerButtons.append(playerInputContainer);
    }
  };
  updatePlayerButtons();

  const categoryButtons = cats.map((cat) =>
    el(
      "button",
      {
        class: "btn btn-category",
        type: "button",
        onclick: () => {
          store.dispatch({ type: TOGGLE_CATEGORY, payload: cat.id });
        },
      },
      [
        el("input", {
          type: "checkbox",
          checked: state.game.categoryIds.includes(cat.id),
          readonly: true,
        }),
        el("span", { text: cat.name }),
      ]
    )
  );

  const categoriesSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "📂" }),
      el("h2", { class: "section-title", text: "CATEGORÍAS" }),
    ]),
    el("div", { class: "category-list" }, categoryButtons),
  ]);

  const impostorControl = el("div", { class: "impostor-control" }, [
    el("button", {
      class: "btn btn-count-control",
      type: "button",
      text: "−",
      onclick: () => {
        const v = parseInt((impostorInput as HTMLInputElement).value, 10);
        if (v > 1) {
          store.dispatch({ type: UPDATE_IMPOSTOR_COUNT, payload: v - 1 });
          (impostorInput as HTMLInputElement).value = String(v - 1);
        }
      },
    }),
    el("input", {
      class: "player-input impostor-input",
      type: "number",
      min: 1,
      max: Math.floor(state.game.playerCount / 2),
      value: state.game.impostorCount,
      onchange: () => {
        const v = parseInt((impostorInput as HTMLInputElement).value, 10);
        if (v >= 1 && v <= Math.floor(store.getState().game.playerCount / 2)) {
           store.dispatch({ type: UPDATE_IMPOSTOR_COUNT, payload: v });
        }
      },
    }),
    el("button", {
      class: "btn btn-count-control",
      type: "button",
      text: "+",
      onclick: () => {
        const v = parseInt((impostorInput as HTMLInputElement).value, 10);
        if (v < Math.floor(state.game.playerCount / 2)) {
          store.dispatch({ type: UPDATE_IMPOSTOR_COUNT, payload: v + 1 });
          (impostorInput as HTMLInputElement).value = String(v + 1);
        }
      },
    }),
  ]);

  const impostorInput = impostorControl.querySelector('input[type="number"]') as HTMLInputElement;

  const impostorsSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "🕵️‍♀️" }),
      el("h2", { class: "section-title", text: "IMPOSTORES" }),
    ]),
    impostorControl,
    el("p", {
      class: "impostor-info",
      text: `${state.game.impostorCount} Impostor${state.game.impostorCount !== 1 ? "s" : ""}`,
    }),
  ]);

  const start = el(
    "button",
    {
      class: "btn btn-primary btn-start",
      type: "button",
      onclick: () => {
        const currentState = store.getState();
        const valid = validateGameDraft(currentState);
        if (!valid.ok) {
           alert(valid.reason);
           return;
        }

        const availableWords: string[] = [];
        for (const categoryId of currentState.game.categoryIds) {
          const cat = currentState.categories.find(c => c.id === categoryId);
          if (cat && cat.words) {
            availableWords.push(...cat.words);
          }
        }
        if (availableWords.length === 0) {
           alert("No se pudo elegir una palabra");
           return;
        }

        const word = availableWords[Math.floor(Math.random() * availableWords.length)];
        store.dispatch({ type: START_GAME, payload: { word } });
        onNavigate("/round");
      },
    },
    ["▶ INICIAR JUEGO"]
  );

  const backButton = el(
    "button",
    {
      class: "btn btn-secondary",
      type: "button",
      onclick: () => onNavigate("/settings"),
    },
    ["Ajustes"]
  );

  const content = el("div", {}, [
    playersSection,
    categoriesSection,
    impostorsSection,
    start,
    backButton,
  ]);

  return { title: "TúImpostor", subtitle: "¿QUIÉN?", content };
}
