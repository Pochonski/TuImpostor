// Combined JavaScript for GitHub Pages deployment
// Supabase Config - Reemplazar con tus credenciales
const SUPABASE_URL = "https://ouqfgqwesqrewdchcwwb.supabase.co";
const SUPABASE_KEY = "sb_publishable_kr5xL4w58XScZhuIegrA_Q_oZhhCya4";
let supabaseClient = null;

if (typeof window.supabase !== "undefined" && SUPABASE_URL.includes("supabase.co")) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

const statusEl = document.getElementById("sync-status");
function setSyncStatus(text, type = "") {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.display = "flex";
  statusEl.style.opacity = "1";
  statusEl.className = `sync-status ${type}`;
}

// State
const state = {
  route: "/",
  lastRoute: null,
  ui: {
    busy: false,
    toast: null,
  },
  settings: {
    sound: true,
    haptics: true,
    nickname: localStorage.getItem("tuimpostor:nickname") || "",
  },
  categories: [],
  game: {
    status: "idle",
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
  },
};

// Storage
const KEY = "tuimpostor:v1";

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePersistedState(persistable) {
  try {
    localStorage.setItem(KEY, JSON.stringify(persistable));
  } catch {
    // ignore
  }
}

function clearPersistedState() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

function ensureCategories(state) {
  if (!state.categories || !Array.isArray(state.categories)) {
    state.categories = [];
  }
  return state.categories;
}

// Categories - simplified version
const defaultCategories = [
  {
    id: "clasico",
    name: "Clásico",
    words: ["perro", "gato", "casa", "árbol", "coche", "sol", "luna", "agua", "fuego", "tierra"]
  }
];

function ensureDefaultCategories(state) {
  if (state.categories.length === 0) {
    state.categories = defaultCategories;
  }
}

function getCategoryById(state, id) {
  return state.categories.find(cat => cat.id === id);
}

// Sync Functions
async function syncFromCloud(state) {
  if (!supabaseClient) return;
  try {
    setSyncStatus("Sincronizando...", "syncing");
    const { data: cloudCats, error } = await supabaseClient.from("categories").select("*");
    if (error) throw error;
    if (cloudCats) {
      cloudCats.forEach(cloudCat => {
        const local = state.categories.find(c => c.id === cloudCat.id);
        if (!local) {
          state.categories.push(cloudCat);
        } else {
          // Merge objects in words array by 'text' property
          const cloudWords = Array.isArray(cloudCat.words) ? cloudCat.words : [];
          const localWords = Array.isArray(local.words) ? local.words : [];

          const wordsMap = new Map();
          // Primero las locales
          localWords.forEach(w => {
            const key = typeof w === "string" ? w.toLowerCase() : w.text.toLowerCase();
            wordsMap.set(key, typeof w === "string" ? { text: w, author: "Sistema" } : w);
          });
          // Luego las de la nube (que sobreescriben o añaden)
          cloudWords.forEach(w => {
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
    setTimeout(() => { if (statusEl) statusEl.style.opacity = "0"; }, 3000);
  } catch (err) {
    console.warn("Cloud sync error:", err);
    setSyncStatus("Offline", "error");
  }
}

async function syncToCloud(category) {
  if (!supabaseClient) return;
  try {
    await supabaseClient.from("categories").upsert({
      id: category.id,
      name: category.name,
      words: category.words,
      author: category.author || "Anónimo",
      updated_at: new Date()
    }, { onConflict: "id" });
  } catch (err) {
    console.warn("Push error (offline):", err);
  }
}

function createCategory(state, name) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, reason: "Nombre vacío" };
  if (state.categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
    return { ok: false, reason: "Ya existe esa categoría" };
  }
  const newCat = {
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name: trimmed,
    words: [],
    author: state.settings.nickname || "Anónimo"
  };
  state.categories.push(newCat);
  syncToCloud(newCat);
  return { ok: true, category: newCat };
}

function addWord(state, categoryId, word) {
  const trimmed = word.trim();
  if (!trimmed) return { ok: false, reason: "Palabra vacía" };
  const cat = getCategoryById(state, categoryId);
  if (!cat) return { ok: false, reason: "Categoría no encontrada" };

  const alreadyExists = cat.words.some(w => {
    const text = typeof w === "string" ? w : w.text;
    return text.toLowerCase() === trimmed.toLowerCase();
  });
  if (alreadyExists) return { ok: true };

  cat.words.push({
    text: trimmed,
    author: state.settings.nickname || "Anónimo"
  });
  syncToCloud(cat);
  return { ok: true };
}

// Game logic
function createNewGameDraft() {
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

function pickRandomWord(state) {
  const availableWords = [];
  for (const categoryId of state.game.categoryIds) {
    const cat = getCategoryById(state, categoryId);
    if (cat && cat.words) {
      availableWords.push(...cat.words);
    }
  }
  if (availableWords.length === 0) return null;
  return availableWords[Math.floor(Math.random() * availableWords.length)];
}

function assignRoles(playerCount, impostorCount) {
  const roles = [];
  for (let i = 0; i < impostorCount; i++) roles.push("impostor");
  for (let i = impostorCount; i < playerCount; i++) roles.push("normal");

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  return roles;
}

function validateGameDraft(state) {
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

function startGame(state) {
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
  state.game.gamePhase = "playing";
  state.game.startShown = true;
  state.game.votedPlayers = [];

  return { ok: true, word };
}

function votePlayer(state, playerIndex) {
  const player = state.game.players[playerIndex];
  if (!player) return { ok: false, error: "Jugador no encontrado" };

  if (!state.game.votedPlayers) {
    state.game.votedPlayers = [];
  }

  if (!state.game.votedPlayers.includes(playerIndex)) {
    state.game.votedPlayers.push(playerIndex);
  }

  state.game.votedPlayer = player;
  state.game.gamePhase = "vote-result";

  return { ok: true, isImpostor: player.role === "impostor" };
}

function revealCurrentPlayer(state) {
  const player = state.game.players[state.game.currentPlayerIndex];
  if (!player) return { ok: false, reason: "No hay jugador actual" };
  player.revealed = true;
  state.game.revealed = true;
  return { ok: true, player };
}

function nextPlayer(state) {
  const nextIdx = state.game.currentPlayerIndex + 1;
  if (nextIdx >= state.game.players.length) {
    state.game.currentPlayerIndex = state.game.players.length - 1;
    return { ok: true, finished: true };
  }
  state.game.currentPlayerIndex = nextIdx;
  state.game.revealed = false;
  return { ok: true, finished: false };
}

function resetGame(state) {
  const savedConfig = {
    playerCount: state.game.playerCount,
    impostorCount: state.game.impostorCount,
    playerNames: state.game.playerNames,
    categoryIds: state.game.categoryIds
  };

  state.game = { ...createNewGameDraft(), ...savedConfig };
  state.game.votedPlayers = [];
  return { ok: true };
}

function revealImpostors(state) {
  state.game.gamePhase = "reveal";
  return { ok: true };
}

// UI functions
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (typeof v === "boolean") {
      if (v) node.setAttribute(k, "");
      else node.removeAttribute(k);
    }
    else node.setAttribute(k, String(v));
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

function screenShell({ title, subtitle, content, nav }) {
  const shell = el("div", { class: "shell" });

  const topbar = el("div", { class: "topbar" }, [
    el("div", { class: "brand" }, [
      el("div", { class: "brand-title", text: title }),
      el("div", { class: "brand-subtitle", text: subtitle }),
    ]),
  ]);

  const screen = el("div", { class: "card screen" }, [
    el("div", { class: "screen-inner" }, [content]),
  ]);

  shell.append(topbar, screen);
  if (nav) shell.append(nav);
  return shell;
}

function makeNav(route, onNavigate) {
  const items = [
    { route: "/", label: "Nueva partida" },
    { route: "/settings", label: "Ajustes" },
  ];

  const nav = el("div", { class: "navbar" });
  for (const item of items) {
    const btn = el("button", {
      class: "navitem",
      type: "button",
      "aria-current": item.route === route ? "page" : "false",
      onclick: () => onNavigate(item.route),
    }, [item.label]);
    nav.append(btn);
  }
  return nav;
}

function viewNewGame({ onNavigate }) {
  const cats = state.categories;

  if (!state.game.playerNames || state.game.playerNames.length === 0) {
    state.game.playerNames = Array.from({ length: state.game.playerCount }, (_, i) => `Jugador ${i + 1}`);
  }

  const playersSection = el("div", { class: "section" }, [
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
          const v = parseInt(playerCount.value, 10);
          if (v > 3) {
            state.game.playerCount = v - 1;
            playerCount.value = v - 1;
            updatePlayerButtons();
          }
        }
      }),
      el("input", {
        class: "player-input",
        type: "number",
        min: 3,
        max: 20,
        value: state.game.playerCount,
        class: "player-input",
        onchange: () => {
          const v = parseInt(playerCount.value, 10);
          if (v >= 3 && v <= 20) state.game.playerCount = v;
          updatePlayerButtons();
        }
      }),
      el("button", {
        class: "btn btn-count-control",
        type: "button",
        text: "+",
        onclick: () => {
          const v = parseInt(playerCount.value, 10);
          if (v < 20) {
            state.game.playerCount = v + 1;
            playerCount.value = v + 1;
            updatePlayerButtons();
          }
        }
      }),
    ]),
    el("div", { class: "player-buttons" }),
  ]);

  const playerCount = playersSection.querySelector('input[type="number"]');
  const playerButtons = playersSection.querySelector('.player-buttons');

  const updatePlayerButtons = () => {
    playerButtons.innerHTML = "";
    for (let i = 0; i < state.game.playerCount; i++) {
      const playerNameInput = el("input", {
        class: "player-input",
        type: "text",
        value: state.game.playerNames[i] || `Jugador ${i + 1}`,
        placeholder: `Jugador ${i + 1}`,
        onchange: (e) => {
          state.game.playerNames[i] = e.target.value || `Jugador ${i + 1}`;
        }
      });

      const playerInputContainer = el("div", { class: "player-input-container" }, [
        playerNameInput,
        el("span", { class: "edit-icon" }, ["✏️"])
      ]);

      playerButtons.append(playerInputContainer);
    }
  };
  updatePlayerButtons();

  const categoryButtons = cats.map(cat =>
    el("button", {
      class: "btn btn-category",
      type: "button",
      onclick: () => {
        const idx = state.game.categoryIds.indexOf(cat.id);
        if (idx >= 0) {
          state.game.categoryIds.splice(idx, 1);
        } else {
          state.game.categoryIds.push(cat.id);
        }
        const root = document.getElementById("app");
        if (root) renderApp(root, state.route, { onNavigate });
      }
    }, [
      el("input", {
        type: "checkbox",
        checked: state.game.categoryIds.includes(cat.id),
        readonly: true,
      }),
      el("span", { text: cat.name })
    ])
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
        const v = parseInt(impostorInput.value, 10);
        if (v > 1) {
          state.game.impostorCount = v - 1;
          impostorInput.value = v - 1;
        }
      }
    }),
    el("input", {
      class: "player-input impostor-input",
      type: "number",
      min: 1,
      max: Math.floor(state.game.playerCount / 2),
      value: state.game.impostorCount,
      onchange: () => {
        const v = parseInt(impostorInput.value, 10);
        if (v >= 1 && v <= Math.floor(state.game.playerCount / 2)) state.game.impostorCount = v;
      }
    }),
    el("button", {
      class: "btn btn-count-control",
      type: "button",
      text: "+",
      onclick: () => {
        const v = parseInt(impostorInput.value, 10);
        if (v < Math.floor(state.game.playerCount / 2)) {
          state.game.impostorCount = v + 1;
          impostorInput.value = v + 1;
        }
      }
    }),
  ]);

  const impostorInput = impostorControl.querySelector('input[type="number"]');

  const impostorsSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "🕵️‍♀️" }),
      el("h2", { class: "section-title", text: "IMPOSTORES" }),
    ]),
    impostorControl,
    el("p", { class: "impostor-info", text: `${state.game.impostorCount} Impostor${state.game.impostorCount !== 1 ? "s" : ""}` }),
  ]);

  const start = el("button", {
    class: "btn btn-primary btn-start",
    type: "button",
    onclick: () => {
      const result = startGame(state);
      if (!result.ok) {
        alert(result.reason);
      } else {
        onNavigate("/round");
      }
    }
  }, ["▶ INICIAR JUEGO"]);

  const backButton = el("button", {
    class: "btn btn-secondary",
    type: "button",
    onclick: () => onNavigate("/settings")
  }, ["Ajustes"]);

  const content = el("div", {}, [
    playersSection,
    categoriesSection,
    impostorsSection,
    start,
    backButton,
  ]);

  return { title: "TúImpostor", subtitle: "¿QUIÉN?", content };
}

function viewRound({ onNavigate }) {
  const { currentPlayerIndex, players, revealed, currentWord, gamePhase } = state.game;
  const player = players[currentPlayerIndex];
  if (!player) return viewNotFound({ onNavigate });

  if (gamePhase === "start") {
    const randomIndex = Math.floor(Math.random() * players.length);
    const randomPlayer = players[randomIndex];

    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¡Inicia el juego!" }),
      el("div", { class: "card" }, [
        el("p", { class: "p", style: "text-align: center; font-size: 18px; margin: 20px 0;" }, [
          `🎮 ${randomPlayer.label} comienza primero`
        ]),
      ]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-danger",
          type: "button",
          onclick: () => {
            if (confirm("¿Revelar impostores? Esto terminará el juego.")) {
              revealImpostors(state);
              const root = document.getElementById("app");
              if (root) {
                renderApp(root, state.route, { onNavigate });
              }
            }
          }
        }, ["Revelar impostores"]),
        el("button", {
          class: "btn btn-primary",
          type: "button",
          onclick: () => {
            state.game.gamePhase = "voting";
            const root = document.getElementById("app");
            if (root) {
              renderApp(root, state.route, { onNavigate });
            }
          }
        }, ["Votar a un jugador"]),
        el("button", {
          class: "btn btn-secondary", type: "button", onclick: () => {
            if (confirm("¿Salir de la partida? Se perderá el progreso.")) {
              resetGame(state);
              onNavigate("/");
            }
          }
        }, ["Salir"]),
      ]),
    ]);

    return { title: "Inicio del juego", subtitle: "Turno inicial", content };
  }

  if (gamePhase === "voting") {
    const votedPlayers = state.game.votedPlayers || [];
    const availablePlayers = players.filter((player, index) => !votedPlayers.includes(index));

    const playerButtons = availablePlayers.map((player, originalIndex) => {
      const playerIndex = players.indexOf(player);
      return el("button", {
        class: "btn btn-player",
        type: "button",
        onclick: () => {
          const result = votePlayer(state, playerIndex);
          if (result.ok) {
            const root = document.getElementById("app");
            if (root) {
              renderApp(root, state.route, { onNavigate });
            }
          }
        }
      }, [player.label]);
    });

    const noPlayersMessage = availablePlayers.length === 0 ?
      el("p", { class: "p", style: "text-align: center; color: var(--muted); margin: 20px 0;" }, [
        "Todos los jugadores ya han sido votados"
      ]) : null;

    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¿Quién es el impostor?" }),
      el("p", { class: "p", text: "Selecciona al jugador que crees que es el impostor:" }),
      el("div", { class: "player-list" }, playerButtons),
      noPlayersMessage,
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-secondary", type: "button", onclick: () => {
            state.game.gamePhase = "start";
            const root = document.getElementById("app");
            if (root) {
              renderApp(root, state.route, { onNavigate });
            }
          }
        }, ["Cancelar"]),
      ]),
    ]);

    return { title: "Votación", subtitle: "Elige al impostor", content };
  }

  if (gamePhase === "vote-result") {
    const votedPlayer = state.game.votedPlayer;
    const isImpostor = votedPlayer.role === "impostor";

    const content = el("div", {}, [
      el("h1", { class: "h1", text: isImpostor ? "¡Correcto!" : "¡Incorrecto!" }),
      el("div", { class: "card" }, [
        el("p", { class: "p", style: "text-align: center; font-size: 18px; margin: 20px 0;" }, [
          `${votedPlayer.label} ${isImpostor ? "SÍ" : "NO"} era el impostor`
        ]),
        el("p", { class: "p", style: "text-align: center; font-size: 16px; color: " + (isImpostor ? "var(--accent-2)" : "var(--danger)") }, [
          isImpostor ? "🎉 ¡Buena deducción!" : "😅 ¡Sigue intentando!"
        ]),
      ]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-danger",
          type: "button",
          onclick: () => {
            if (confirm("¿Revelar impostores? Esto terminará el juego.")) {
              revealImpostors(state);
              const root = document.getElementById("app");
              if (root) {
                renderApp(root, state.route, { onNavigate });
              }
            }
          }
        }, ["Revelar impostores"]),
        el("button", {
          class: "btn btn-primary",
          type: "button",
          onclick: () => {
            state.game.gamePhase = "voting";
            const root = document.getElementById("app");
            if (root) {
              renderApp(root, state.route, { onNavigate });
            }
          }
        }, ["Votar a un jugador"]),
        el("button", {
          class: "btn btn-secondary", type: "button", onclick: () => {
            const result = startGame(state);
            if (result.ok) {
              const root = document.getElementById("app");
              if (root) {
                renderApp(root, state.route, { onNavigate });
              }
            } else {
              alert(result.reason);
            }
          }
        }, ["Seguir jugando"]),
      ]),
    ]);

    return { title: "Resultado de votación", subtitle: isImpostor ? "¡Acertaste!" : "¡Fallaste!", content };
  }

  if (gamePhase === "reveal") {
    const impostors = players.filter(p => p.role === "impostor");
    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¡Revelar impostores!" }),
      el("p", { class: "p", text: `La palabra era: ${currentWord}` }),
      el("div", { class: "section" }, [
        el("div", { class: "section-header" }, [
          el("span", { text: "🕵️‍♀️" }),
          el("h2", { class: "section-title", text: "IMPOSTORES" }),
        ]),
        el("div", { class: "category-list" },
          impostors.map(impostor =>
            el("div", { class: "impostor-item" }, [
              el("span", { text: "🎭" }),
              el("span", { text: impostor.label })
            ])
          )
        ),
      ]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-primary",
          type: "button",
          onclick: () => {
            resetGame(state);
            onNavigate("/");
          }
        }, ["Nueva partida"]),
        el("button", {
          class: "btn btn-secondary", type: "button", onclick: () => {
            resetGame(state);
            onNavigate("/");
          }
        }, ["Volver al inicio"]),
      ]),
    ]);

    return { title: "¡Fin del juego!", subtitle: "Impostores revelados", content };
  }

  const content = el("div", {}, [
    el("div", { class: "flip-card" }, [
      el("div", { class: "flip-card-inner" }, [
        el("div", { class: "flip-card-front" }, [
          el("div", { class: "card-content" }, [
            el("h2", { class: "h2", text: `${player.label}` }),
            el("p", { class: "p", text: `Jugador ${currentPlayerIndex + 1} de ${players.length}` }),
            el("div", { class: "reveal-hint" }, [
              //el("span", { text: "👁️" }),
              el("p", { class: "p", text: "¿Listo para revelar? (Mantén presionado para ver)" })
            ])
          ])
        ]),
        el("div", { class: `flip-card-back ${player.role === "impostor" ? "impostor" : ""}` }, [
          el("div", { class: "card-content" }, [
            el("h2", { class: "h2", text: player.role === "impostor" ? "🎭 IMPOSTOR" : `🎯 ${currentWord}` }),
            el("p", { class: "p", text: player.role === "impostor" ? "Tu objetivo es hacer que los demás adivinen mal" : `Tu palabra es: ${currentWord}` })
          ])
        ])
      ])
    ])
  ]);

  const revealArea = el("div", { class: "reveal-area" }, [content]);

  const refreshReveal = () => {
    const flipCard = revealArea.querySelector('.flip-card');

    const handleReveal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      flipCard.classList.add("flipped");
    };

    const handleHide = (e) => {
      e.preventDefault();
      e.stopPropagation();
      flipCard.classList.remove("flipped");
      if (!player.revealed && (e.type === 'mouseup' || e.type === 'touchend')) {
        revealCurrentPlayer(state);
        const root = document.getElementById("app");
        if (root) renderApp(root, state.route, { onNavigate });
      }
    };

    flipCard.addEventListener('mousedown', handleReveal);
    flipCard.addEventListener('touchstart', handleReveal);
    flipCard.addEventListener('mouseup', handleHide);
    flipCard.addEventListener('touchend', handleHide);
    flipCard.addEventListener('mouseleave', () => flipCard.classList.remove("flipped"));

    if (player.revealed) {
      const isLastPlayer = currentPlayerIndex === players.length - 1;
      const nextBtn = el("button", {
        class: "btn btn-primary",
        type: "button",
        style: "margin-top: 12px;",
        onclick: (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (window._isNextRunning) return;
          window._isNextRunning = true;

          if (isLastPlayer) {
            state.game.gamePhase = "start";
            state.game.currentPlayerIndex = 0;
            state.game.revealed = false;
            const root = document.getElementById("app");
            if (root) renderApp(root, state.route, { onNavigate });
          } else {
            const res = nextPlayer(state);
            if (res.finished) {
              onNavigate("/round-end");
            } else {
              const root = document.getElementById("app");
              if (root) renderApp(root, state.route, { onNavigate });
            }
          }

          setTimeout(() => { window._isNextRunning = false; }, 600);
        },
      }, [isLastPlayer ? "Iniciar juego" : "Siguiente jugador"]);

      revealArea.append(nextBtn);
    }
  };
  refreshReveal();

  const actions = [];

  actions.push(
    el("button", {
      class: "btn btn-secondary", type: "button", onclick: () => {
        if (confirm("¿Salir de la partida? Se perderá el progreso.")) {
          resetGame(state);
          onNavigate("/");
        }
      }
    }, ["Salir"])
  );

  return { title: "Tu turno", subtitle: player.label, content: revealArea };
}

function viewSettings({ onNavigate }) {
  const catList = el("div", { class: "category-list" });
  const refreshCats = () => {
    catList.innerHTML = "";
    state.categories.forEach(cat => {
      catList.append(el("div", {
        class: "btn btn-category-manage",
        onclick: () => onNavigate(`/categories/${cat.id}`)
      }, [
        el("span", { text: `${cat.name} (${cat.words.length})` })
      ]));
    });
  };
  refreshCats();

  const addForm = el("form", {
    class: "actions",
    onsubmit: (e) => {
      e.preventDefault();
      const input = e.target.querySelector("input");
      const res = createCategory(state, input.value);
      if (res.ok) {
        input.value = "";
        refreshCats();
      } else alert(res.reason);
    }
  }, [
    el("input", { type: "text", placeholder: "Nueva categoría", required: true }),
    el("button", { class: "btn btn-primary", type: "submit", text: "Añadir" })
  ]);

  const profileSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [el("span", { text: "👤" }), el("h2", { text: "MI PERFIL" })]),
    el("input", {
      type: "text",
      class: "player-input",
      placeholder: "Tu apodo (ej: Juanito)",
      value: state.settings.nickname,
      oninput: (e) => {
        state.settings.nickname = e.target.value;
        localStorage.setItem("tuimpostor:nickname", e.target.value);
      }
    }),
    el("p", { class: "small", style: "margin-top:4px", text: "Este nombre aparecerá junto a las palabras que crees." })
  ]);

  const content = el("div", {}, [
    profileSection,
    el("h2", { class: "h2", style: "margin-top:20px", text: "Categorías Globales" }),
    catList,
    addForm,
    el("button", { class: "btn btn-primary", style: "margin-top:12px", onclick: () => { resetGame(state); onNavigate("/"); } }, ["Nueva partida"]),
    el("button", { class: "btn btn-secondary", style: "margin-top:12px", onclick: () => onNavigate("/") }, ["Volver"])

  ]);

  return { title: "Ajustes", subtitle: "Comunidad", content };
}

function viewCategoryDetail({ categoryId, onNavigate }) {
  const cat = getCategoryById(state, categoryId);
  if (!cat) return viewNotFound({ onNavigate });

  const wordList = el("div", { class: "player-list" });
  const refreshWords = () => {
    wordList.innerHTML = "";
    cat.words.forEach(wordObj => {
      const text = typeof wordObj === "string" ? wordObj : wordObj.text;
      const author = typeof wordObj === "string" ? "Sistema" : (wordObj.author || "Anónimo");

      const item = el("div", {
        class: "btn btn-player",
        style: "pointer-events:none; justify-content: space-between;"
      }, [
        el("span", { text }),
        el("span", {
          style: "font-size: 10px; opacity: 0.5; font-style: italic;",
          text: `por ${author}`
        })
      ]);
      wordList.append(item);
    });
  };
  refreshWords();

  const addWordForm = el("form", {
    class: "actions",
    onsubmit: (e) => {
      e.preventDefault();
      const input = e.target.querySelector("input");
      const res = addWord(state, categoryId, input.value);
      if (res.ok) {
        input.value = "";
        refreshWords();
      }
    }
  }, [
    el("input", { type: "text", placeholder: "Nueva palabra", required: true }),
    el("button", { class: "btn btn-primary", type: "submit", text: "Añadir Palabra" })
  ]);

  const content = el("div", {}, [
    el("h2", { class: "h2", text: cat.name },),
    el("p", { class: "p", text: "Estas palabras se sincronizan para todos los jugadores." }),
    wordList,
    addWordForm,
    el("button", { class: "btn btn-secondary", style: "margin-top:20px", onclick: () => onNavigate("/settings") }, ["Ajustes"])
  ]);

  return { title: cat.name, subtitle: "Palabras", content };
}

function viewNotFound({ onNavigate }) {
  const content = el("div", {}, [
    el("h1", { class: "h1", text: "404" }),
    el("p", { class: "p", text: "Página no encontrada" }),
    el("div", { class: "actions" }, [
      el("button", {
        class: "btn btn-primary",
        type: "button",
        onclick: () => onNavigate("/")
      }, ["Ir al inicio"]),
    ]),
  ]);

  return { title: "TúImpostor", subtitle: "404", content };
}

function renderApp(root, route, { onNavigate }) {
  const routes = {
    "/": viewNewGame,
    "/new": viewNewGame,
    "/settings": viewSettings,
    "/round": viewRound,
  };

  const dynamicMatch = /^\/categories\/([^\/]+)$/.exec(route);
  let model;
  if (dynamicMatch) {
    model = viewCategoryDetail({ categoryId: dynamicMatch[1], onNavigate });
  } else {
    const view = routes[route] || viewNotFound;
    model = view({ onNavigate });
  }

  const nav = route !== "/" ? makeNav(route, onNavigate) : null;
  const next = screenShell({
    title: model.title,
    subtitle: model.subtitle,
    content: model.content,
    nav,
  });
  root.innerHTML = "";
  root.append(next);
}

// App initialization
function normalizeRoute(pathname) {
  if (!pathname) return "/";
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean;
}

function getRouteFromLocation() {
  const url = new URL(window.location.href);
  const baseAttr = document.querySelector('base')?.getAttribute('href');
  let pathname = url.pathname;

  if (baseAttr && baseAttr !== "/" && pathname.startsWith(baseAttr)) {
    // Si la base es /TuImpostor/ y el path es /TuImpostor/new, queremos /new
    pathname = pathname.substring(baseAttr.length - 1);
  } else if (pathname.startsWith("/TuImpostor")) {
    // Fallback manual si no hay base tag pero estamos en el subpath conocido
    pathname = pathname.substring("/TuImpostor".length);
  }

  return normalizeRoute(pathname || "/");
}

function setRoute(route, { push = true } = {}) {
  const next = normalizeRoute(route);
  if (state.route === next) return;

  state.lastRoute = state.route;
  state.route = next;

  if (push) {
    const baseAttr = document.querySelector('base')?.getAttribute('href');
    let fullPath = next;

    if (baseAttr && baseAttr !== "/") {
      const cleanBase = baseAttr.replace(/\/$/, "");
      fullPath = cleanBase + next;
    } else if (window.location.pathname.startsWith("/TuImpostor")) {
      fullPath = "/TuImpostor" + next;
    }

    history.pushState({ route: next }, "", fullPath);
  }

  render();
}

function render() {
  const root = document.getElementById("app");
  if (!root) return;

  renderApp(root, state.route, {
    onNavigate: (to) => setRoute(to, { push: true }),
  });
}

function hydrate() {
  const persisted = loadPersistedState();
  if (persisted?.settings) {
    state.settings = { ...state.settings, ...persisted.settings };
  }
  if (persisted?.categories) {
    state.categories = persisted.categories;
  }
  if (persisted?.game) {
    state.game = { ...createNewGameDraft(), ...persisted.game };
  }
  ensureCategories(state);
  ensureDefaultCategories(state);
  syncFromCloud(state); // Sync cloud after local load
}

function persist() {
  savePersistedState({
    settings: state.settings,
    categories: state.categories,
    game: state.game,
  });
}

function interceptLinkClicks() {
  document.addEventListener("click", (ev) => {
    const a = ev.target?.closest?.("a");
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || !href.startsWith("/")) return;

    ev.preventDefault();
    setRoute(href, { push: true });
  });
}

function onPopState() {
  window.addEventListener("popstate", (ev) => {
    const route = ev.state?.route ?? getRouteFromLocation();
    state.route = normalizeRoute(route);
    render();
  });
}

function ensureKnownInitialRoute() {
  const initial = getRouteFromLocation();
  const known = new Set(["/", "/new", "/settings", "/categories", "/round"]);
  state.route = known.has(initial) ? initial : "/";

  const baseAttr = document.querySelector('base')?.getAttribute('href');
  let fullPath = state.route;
  if (baseAttr && baseAttr !== "/") {
    fullPath = baseAttr.replace(/\/$/, "") + state.route;
  } else if (window.location.pathname.startsWith("/TuImpostor")) {
    fullPath = "/TuImpostor" + state.route;
  }

  history.replaceState({ route: state.route }, "", fullPath);
}

function setupAutoPersist() {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persist();
  });
  window.addEventListener("beforeunload", () => persist());
}

function initApp() {
  hydrate();
  ensureKnownInitialRoute();
  interceptLinkClicks();
  onPopState();
  setupAutoPersist();
  render();
}

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
