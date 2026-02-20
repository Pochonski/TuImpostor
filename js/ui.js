import { state } from "./state.js";
import { createCategory, deleteCategory, addWord, removeWord, getCategoryById } from "./categories.js";
import { startGame, revealCurrentPlayer, nextPlayer, resetGame, validateGameDraft, startGamePhase, revealImpostors } from "./game.js";

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else if (typeof v === "boolean") {
      // Manejar atributos booleanos correctamente
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

  const bar = el(
    "div",
    { class: "navbar" },
    items.map((it) =>
      el("button", {
        class: "navitem",
        type: "button",
        "aria-current": it.route === route ? "page" : "false",
        onclick: () => onNavigate(it.route),
      }, [it.label])
    )
  );

  return bar;
}

function viewMenu({ onNavigate }) {
  // Redirigir automáticamente a /new
  onNavigate("/new");
  
  const content = el("div", {}, [
    el("p", { class: "p", text: "Cargando..." }),
  ]);

  return { title: "TúImpostor", subtitle: "Juego social", content };
}

function viewNewGame({ onNavigate }) {
  const cats = state.categories;

  // Inicializar nombres de jugadores si es necesario
  if (!state.game.playerNames || state.game.playerNames.length === 0) {
    state.game.playerNames = Array.from({ length: state.game.playerCount }, (_, i) => `Jugador ${i + 1}`);
  }

  // Sección MODO DE JUEGO
  const modeSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "🎮" }),
      el("h2", { class: "section-title", text: "MODO DE JUEGO" }),
    ]),
    el("div", { class: "mode-buttons" }, [
      el("button", { class: "btn btn-mode active", type: "button", disabled: true }, ["👥 Clásico"]),
      el("button", { 
        class: "btn btn-mode", 
        type: "button", 
        onclick: () => {
          alert("🚀 Modo en línea disponible próximamente");
        }
      }, ["🌐 En línea"]),
    ]),
  ]);

  // Sección JUGADORES
  const playerCount = el("input", { 
    type: "number", 
    min: 3, 
    max: 20, 
    value: state.game.playerCount, 
    class: "player-input",
    onchange: () => {
      const v = parseInt(playerCount.value, 10);
      if (v >= 3 && v <= 20) state.game.playerCount = v;
    } 
  });

  const playerButtons = el("div", { class: "player-buttons" });
  const updatePlayerButtons = () => {
    playerButtons.innerHTML = "";
    
    // Asegurar que el array de nombres tenga el tamaño correcto
    while (state.game.playerNames.length < state.game.playerCount) {
      state.game.playerNames.push(`Jugador ${state.game.playerNames.length + 1}`);
    }
    while (state.game.playerNames.length > state.game.playerCount) {
      state.game.playerNames.pop();
    }
    
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
      playerButtons.append(playerNameInput);
    }
  };
  updatePlayerButtons();

  const playersSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "👋" }),
      el("h2", { class: "section-title", text: "JUGADORES" }),
    ]),
    el("div", { class: "player-count-control" }, [
      el("button", { 
        class: "btn btn-count-control", 
        type: "button", 
        text: "-",
        onclick: () => {
          if (state.game.playerCount > 3) {
            state.game.playerCount--;
            playerCount.value = state.game.playerCount;
            updatePlayerButtons();
          }
        }
      }),
      playerCount,
      el("button", { 
        class: "btn btn-count-control", 
        type: "button", 
        text: "+",
        onclick: () => {
          if (state.game.playerCount < 20) {
            state.game.playerCount++;
            playerCount.value = state.game.playerCount;
            updatePlayerButtons();
          }
        }
      }),
    ]),
    playerButtons,
  ]);

  // Sección CATEGORÍAS
  const catList = el("div", { class: "category-list" });
  const refreshCats = () => {
    catList.innerHTML = "";
    cats.forEach((cat) => {
      const checked = state.game.categoryIds.includes(cat.id);
      const item = el("label", { class: "btn btn-category", style: "display:flex;align-items:center;gap:8px;" }, [
        el("input", { type: "checkbox", checked, onchange: (e) => {
          if (e.target.checked) {
            if (!state.game.categoryIds.includes(cat.id)) {
              state.game.categoryIds.push(cat.id);
            }
          } else {
            const idx = state.game.categoryIds.indexOf(cat.id);
            if (idx !== -1) {
              state.game.categoryIds.splice(idx, 1);
            }
          }
        } }),
        el("span", { text: cat.name }),
      ]);
      catList.append(item);
    });
  };
  refreshCats();

  const categoriesSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "🏠" }),
      el("h2", { class: "section-title", text: "CATEGORÍAS" }),
    ]),
    catList,
  ]);

  // Sección IMPOSTORES
  const impostorCount = el("input", { 
    type: "number", 
    min: 1, 
    max: state.game.playerCount - 1, 
    value: state.game.impostorCount,
    class: "impostor-input",
    onchange: () => {
      const v = parseInt(impostorCount.value, 10);
      if (v >= 1 && v < state.game.playerCount) state.game.impostorCount = v;
    } 
  });

  const impostorsSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "🥸" }),
      el("h2", { class: "section-title", text: "IMPOSTORES" }),
    ]),
    el("div", { class: "impostor-control" }, [
      el("button", { 
        class: "btn btn-count-control", 
        type: "button", 
        text: "-",
        onclick: () => {
          if (state.game.impostorCount > 1) {
            state.game.impostorCount--;
            impostorCount.value = state.game.impostorCount;
          }
        }
      }),
      impostorCount,
      el("button", { 
        class: "btn btn-count-control", 
        type: "button", 
        text: "+",
        onclick: () => {
          if (state.game.impostorCount < state.game.playerCount - 1) {
            state.game.impostorCount++;
            impostorCount.value = state.game.impostorCount;
          }
        }
      }),
    ]),
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
    modeSection,
    playersSection,
    categoriesSection,
    impostorsSection,
    start,
    backButton,
  ]);

  return { title: "IMPOSTOR", subtitle: "¿QUIÉN?", content };
}

function viewSettings({ onNavigate }) {
  // Sección de categorías
  const catList = el("div", { class: "category-list" });

  const refreshCats = () => {
    catList.innerHTML = "";
    const cats = state.categories;
    if (!cats.length) {
      catList.append(el("p", { class: "p", text: "No hay categorías." }));
    } else {
      cats.forEach((cat) => {
        const item = el("div", { 
          class: "btn btn-category-manage", 
          onclick: () => onNavigate(`/categories/${cat.id}`) 
        }, [
          el("span", { text: `${cat.name} (${cat.words.length} palabras)` }),
        ]);
        catList.append(item);
      });
    }
  };
  refreshCats();

  const addForm = el("form", { class: "actions", onsubmit: (e) => {
    e.preventDefault();
    const input = e.target.querySelector("input[type=text]");
    const name = input.value.trim();
    const result = createCategory(state, name);
    if (result.ok) {
      input.value = "";
      refreshCats();
    } else {
      alert(result.reason);
    }
  } }, [
    el("input", { type: "text", placeholder: "Nueva categoría", required: true }),
    el("button", { class: "btn btn-primary", type: "submit", text: "Añadir" }),
  ]);

  const categoriesSection = el("div", { class: "section" }, [
    el("div", { class: "section-header" }, [
      el("span", { text: "🏠" }),
      el("h2", { class: "section-title", text: "CATEGORÍAS" }),
    ]),
    catList,
    addForm,
  ]);

  const content = el("div", {}, [
    el("h1", { class: "h1", text: "Ajustes" }),
    el("p", { class: "p", text: "Gestiona tus categorías y palabras." }),
    categoriesSection,
    el("div", { class: "actions" }, [
      el("button", { class: "btn btn-secondary", type: "button", onclick: () => onNavigate("/") }, ["Volver"]),
    ]),
  ]);

  return { title: "Ajustes", subtitle: "Preferencias", content };
}

function viewCategories({ onNavigate }) {
  const list = el("div", { class: "actions" });

  const refresh = () => {
    list.innerHTML = "";
    const cats = state.categories;
    if (!cats.length) {
      list.append(el("p", { class: "p", text: "No hay categorías." }));
    } else {
      cats.forEach((cat) => {
        const item = el("div", { class: "btn btn-secondary", onclick: () => onNavigate(`/categories/${cat.id}`) }, [
          el("span", { text: `${cat.name} (${cat.words.length} palabras)` }),
        ]);
        list.append(item);
      });
    }
  };
  refresh();

  const addForm = el("form", { class: "actions", onsubmit: (e) => {
    e.preventDefault();
    const input = e.target.querySelector("input[type=text]");
    const name = input.value.trim();
    const result = createCategory(state, name);
    if (result.ok) {
      input.value = "";
      refresh();
    } else {
      alert(result.reason);
    }
  } }, [
    el("input", { type: "text", placeholder: "Nueva categoría", required: true }),
    el("button", { class: "btn btn-primary", type: "submit", text: "Añadir" }),
  ]);

  const content = el("div", {}, [
    el("h1", { class: "h1", text: "Categorías" }),
    el("p", { class: "p", text: "Gestiona tus categorías y palabras." }),
    list,
    addForm,
    el("div", { class: "actions" }, [
      el("button", { class: "btn btn-secondary", type: "button", onclick: () => onNavigate("/") }, ["Volver al menú"]),
    ]),
  ]);

  return { title: "Categorías", subtitle: "Gestión", content };
}

function viewCategoryDetail({ categoryId, onNavigate }) {
  const cat = getCategoryById(state, categoryId);
  if (!cat) {
    return viewNotFound({ onNavigate });
  }

  const list = el("div", { class: "actions" });

  const refresh = () => {
    list.innerHTML = "";
    if (!cat.words.length) {
      list.append(el("p", { class: "p", text: "No hay palabras." }));
    } else {
      cat.words.forEach((word) => {
        const item = el("div", { class: "btn btn-secondary", onclick: () => {
          if (confirm(`¿Eliminar "${word}"?`)) {
            const result = removeWord(state, categoryId, word);
            if (!result.ok) alert(result.reason);
            refresh();
          }
        } }, [
          el("span", { text: word }),
        ]);
        list.append(item);
      });
    }
  };
  refresh();

  const addForm = el("form", { class: "actions", onsubmit: (e) => {
    e.preventDefault();
    const input = e.target.querySelector("input[type=text]");
    const word = input.value.trim();
    const result = addWord(state, categoryId, word);
    if (result.ok) {
      input.value = "";
      refresh();
    } else {
      alert(result.reason);
    }
  } }, [
    el("input", { type: "text", placeholder: "Nueva palabra", required: true }),
    el("button", { class: "btn btn-primary", type: "submit", text: "Añadir" }),
  ]);

  const content = el("div", {}, [
    el("h1", { class: "h1", text: cat.name }),
    el("p", { class: "p", text: `Palabras: ${cat.words.length}` }),
    list,
    addForm,
    el("div", { class: "actions" }, [
      el("button", { class: "btn btn-danger", type: "button", onclick: () => {
        if (confirm(`¿Eliminar categoría "${cat.name}"?`)) {
          const result = deleteCategory(state, categoryId);
          if (!result.ok) alert(result.reason);
          onNavigate("/categories");
        }
      } }, ["Eliminar categoría"]),
      el("button", { class: "btn btn-secondary", type: "button", onclick: () => onNavigate("/categories") }, ["Volver"]),
    ]),
  ]);

  return { title: cat.name, subtitle: "Palabras", content };
}

function viewRound({ onNavigate }) {
  const { currentPlayerIndex, players, revealed, currentWord, gamePhase } = state.game;
  const player = players[currentPlayerIndex];
  if (!player) return viewNotFound({ onNavigate });

  // Si estamos en fase "ready", mostrar pantalla de iniciar juego
  if (gamePhase === "ready") {
    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¡Todos listos!" }),
      el("p", { class: "p", text: "Todos los jugadores han visto su palabra" }),
      el("div", { class: "actions" }, [
        el("button", { 
          class: "btn btn-primary btn-start", 
          type: "button", 
          onclick: () => {
            startGamePhase(state);
            // Elegir un jugador aleatorio para comenzar
            const randomIndex = Math.floor(Math.random() * players.length);
            state.game.currentPlayerIndex = randomIndex;
            const root = document.getElementById("app");
            if (root) {
              renderApp(root, state.route, { onNavigate });
            }
          }
        }, ["Iniciar juego"]),
        el("button", { class: "btn btn-secondary", type: "button", onclick: () => {
          if (confirm("¿Salir de la partida? Se perderá el progreso.")) {
            resetGame(state);
            onNavigate("/");
          }
        } }, ["Salir"]),
      ]),
    ]);

    return { title: "¡Listos para jugar!", subtitle: "Fase de preparación", content };
  }

  // Si estamos en fase "reveal", mostrar pantalla de revelar impostores
  if (gamePhase === "reveal") {
    const impostors = players.filter(p => p.role === "impostor");
    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¡Revelar impostores!" }),
      el("p", { class: "p", text: `La palabra era: ${currentWord}` }),
      el("div", { class: "section" }, [
        el("div", { class: "section-header" }, [
          el("span", { text: "🕵️" }),
          el("h2", { class: "section-title", text: "IMPOSTORES" }),
        ]),
        ...impostors.map(imp => 
          el("div", { class: "btn btn-danger", style: "pointer-events: none; margin-bottom: 8px;" }, [imp.label])
        ),
      ]),
      el("div", { class: "actions" }, [
        el("button", { class: "btn btn-primary", type: "button", onclick: () => {
          resetGame(state);
          onNavigate("/");
        } }, ["Nueva partida"]),
      ]),
    ]);

    return { title: "Fin del juego", subtitle: "Impostores revelados", content };
  }

  // Renderizar pantalla de juego principal

  // Si estamos en fase "playing" y queremos mostrar quién comienza
  if (gamePhase === "playing" && !state.game.startShown) {
    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¡Comienza el juego!" }),
      el("div", { class: "card" }, [
        el("p", { class: "p", style: "text-align: center; font-size: 18px; margin: 20px 0;" }, [
          `🎮 ${player.label} comienza primero`
        ]),
      ]),
      el("div", { class: "actions" }, [
        el("button", { 
          class: "btn btn-primary", 
          type: "button", 
          onclick: () => {
            // Marcar que ya se mostró quién comienza
            state.game.startShown = true;
            const root = document.getElementById("app");
            if (root) {
              renderApp(root, state.route, { onNavigate });
            }
          }
        }, ["Continuar"]),
        el("button", { class: "btn btn-secondary", type: "button", onclick: () => {
          if (confirm("¿Salir de la partida? Se perderá el progreso.")) {
            resetGame(state);
            onNavigate("/");
          }
        } }, ["Salir"]),
      ]),
    ]);

    return { title: "Inicio del juego", subtitle: "Turno inicial", content };
  }

  const revealArea = el("div", { class: "reveal-area" });
  let revealBtn = null;
  let nextBtn = null;
  let flipCard = null;

  const refreshReveal = () => {
    revealArea.innerHTML = "";
    
    // Crear la carta volteable
    const isImpostor = player.role === "impostor";
    flipCard = el("div", { class: "flip-card" }, [
      el("div", { class: "flip-card-inner" }, [
        el("div", { class: "flip-card-front" }, ["¿Lista para revelar?"]),
        el("div", { class: `flip-card-back ${isImpostor ? "impostor" : ""}` }, [
          isImpostor ? "¡ERES EL IMPOSTOR!" : currentWord
        ])
      ])
    ]);
    
    revealArea.append(flipCard);
    
    if (!revealed) {
      // Botón que mantiene presionado para revelar
      revealBtn = el("button", {
        class: "btn btn-primary",
        type: "button",
      }, ["Mantener presionado para revelar"]);
      
      // Agregar eventos manualmente para asegurar que funcionen
      revealBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        flipCard.classList.add("flipped");
      });

      revealBtn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        if (!state.game.revealed) {
          revealCurrentPlayer(state);
        }
        const root = document.getElementById("app");
        if (root) {
          renderApp(root, state.route, { onNavigate });
        }
      });

      revealBtn.addEventListener('mouseleave', (e) => {
        // Solo quitar la clase temporal si aún no se confirmó la revelación
        if (!state.game.revealed) flipCard.classList.remove("flipped");
      });

      revealBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        flipCard.classList.add("flipped");
      });

      revealBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!state.game.revealed) {
          revealCurrentPlayer(state);
        }
        const root = document.getElementById("app");
        if (root) {
          renderApp(root, state.route, { onNavigate });
        }
      });
      
      revealArea.append(revealBtn);
      
      nextBtn = el("button", {
        class: "btn btn-secondary",
        type: "button",
        style: "margin-top: 12px;",
        onclick: () => {
          const res = nextPlayer(state);
          if (res.finished) {
            onNavigate("/round-end");
          } else {
            // Re-renderizar la app con el nuevo estado del jugador
            const root = document.getElementById("app");
            if (root) {
              renderApp(root, state.route, { onNavigate });
            }
          }
        },
      }, ["Siguiente jugador"]);
      revealArea.append(nextBtn);
    } else {
      // Mostrar permanentemente revelado
      flipCard.classList.add("flipped");
      
      nextBtn = el("button", {
        class: "btn btn-primary",
        type: "button",
        style: "margin-top: 12px;",
        onclick: () => {
          const res = nextPlayer(state);
          if (res.finished) {
            onNavigate("/round-end");
          } else {
            // Re-renderizar la app con el nuevo estado del jugador
            const root = document.getElementById("app");
            if (root) {
              renderApp(root, state.route, { onNavigate });
            }
          }
        },
      }, ["Siguiente jugador"]);
      revealArea.append(nextBtn);
    }
  };
  refreshReveal();

  // Mostrar botón de revelar solo cuando todos han jugado
  const isLastPlayer = currentPlayerIndex === players.length - 1;
  const allPlayersRevealed = players.every(p => p.revealed);
  
  const actions = [];
  
  if (isLastPlayer && allPlayersRevealed) {
    // Último jugador y todos han revelado - mostrar botón de revelar
    actions.push(
      el("button", { class: "btn btn-danger", type: "button", onclick: () => {
        if (confirm("¿Revelar impostores? Esto terminará el juego.")) {
          revealImpostors(state);
          const root = document.getElementById("app");
          if (root) {
            renderApp(root, state.route, { onNavigate });
          }
        }
      } }, ["Revelar impostores"])
    );
  }
  
  actions.push(
    el("button", { class: "btn btn-secondary", type: "button", onclick: () => {
      if (confirm("¿Salir de la partida? Se perderá el progreso.")) {
        resetGame(state);
        onNavigate("/");
      }
    } }, ["Salir"])
  );

  const content = el("div", {}, [
    el("h1", { class: "h1", text: player.label }),
    el("p", { class: "p", text: `Jugador ${currentPlayerIndex + 1} de ${players.length}` }),
    revealArea,
    el("div", { class: "actions" }, actions),
  ]);

  return { title: player.label, subtitle: "Tu turno", content };
}

function viewRoundEnd({ onNavigate }) {
  const { currentWord, players } = state.game;
  const impostors = players.filter(p => p.role === "impostor").map(p => p.label).join(", ");

  const content = el("div", {}, [
    el("h1", { class: "h1", text: "Ronda finalizada" }),
    el("p", { class: "p", text: `La palabra era: ${currentWord}` }),
    el("p", { class: "p", text: `Impostores: ${impostors}` }),
    el("div", { class: "actions" }, [
      el("button", { class: "btn btn-primary", type: "button", onclick: () => {
        resetGame(state);
        onNavigate("/");
      } }, ["Nueva partida"]),
      el("button", { class: "btn btn-secondary", type: "button", onclick: () => {
        resetGame(state);
        onNavigate("/");
      } }, ["Volver al inicio"]),
    ]),
  ]);

  return { title: "Fin de ronda", subtitle: "Resultados", content };
}

function viewNotFound({ onNavigate }) {
  const content = el("div", {}, [
    el("h1", { class: "h1", text: "No encontrado" }),
    el("p", { class: "p", text: "La ruta no existe." }),
    el("div", { class: "actions" }, [
      el("button", { class: "btn btn-primary", type: "button", onclick: () => onNavigate("/") }, ["Ir al menú"]),
    ]),
  ]);

  return { title: "TúImpostor", subtitle: "404", content };
}

export function renderApp(root, route, { onNavigate }) {
  const routes = {
    "/": viewNewGame,
    "/new": viewNewGame,
    "/settings": viewSettings,
    "/categories": viewCategories,
    "/round": viewRound,
    "/round-end": viewRoundEnd,
  };

  const match = /^\/categories\/([^\/]+)$/.exec(route);
  if (match) {
    const categoryId = match[1];
    const model = viewCategoryDetail({ categoryId, onNavigate });
    const nav = makeNav(route, onNavigate);
    const next = screenShell({
      title: model.title,
      subtitle: model.subtitle,
      content: model.content,
      nav,
    });
    next.classList.add("fade");
    root.replaceChildren(next);
    requestAnimationFrame(() => { next.classList.add("is-in"); });
    return;
  }

  const view = routes[route] ?? viewNotFound;
  const model = view({ onNavigate });
  const nav = makeNav(route, onNavigate);

  const next = screenShell({
    title: model.title,
    subtitle: model.subtitle,
    content: model.content,
    nav,
  });

  next.classList.add("fade");

  root.replaceChildren(next);

  requestAnimationFrame(() => {
    next.classList.add("is-in");
  });
}
