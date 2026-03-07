import { store } from "../store/store.js";
import { el } from "../dom/el.js";
import { REVEAL_IMPOSTORS, VOTE_PLAYER, NEXT_PLAYER, RESET_GAME, REVEAL_CURRENT_PLAYER, START_GAME, FINISH_REVEAL_PHASE, SET_GAME_PHASE } from "../store/actions.js";
import { pickRandomWord } from "../game/engine.js";
import { viewNotFound } from "./notFound.js";

export function viewRound({ onNavigate, onRefresh }) {
  const state = store.getState();
  const { currentPlayerIndex, players, currentWord, gamePhase } = state.game;
  const displayWord = currentWord ? (typeof currentWord === "object" ? currentWord.text : currentWord) : "";
  const player = players[currentPlayerIndex];

  if (!player) return viewNotFound({ onNavigate });

  if (gamePhase === "start") {
    const randomIndex = Math.floor(Math.random() * players.length);
    const randomPlayer = players[randomIndex];
    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¡Inicia el juego!" }),
      el("div", { class: "card" }, [
        el("p", {
          class: "p",
          style: "text-align: center; font-size: 18px; margin: 20px 0;",
        }, [`🎮 ${randomPlayer.label} comienza primero`]),
      ]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-danger",
          type: "button",
          onclick: () => {
            if (confirm("¿Revelar impostores? Esto terminará el juego.")) {
              store.dispatch({ type: REVEAL_IMPOSTORS });
            }
          },
        }, ["Revelar impostores"]),
        el("button", {
          class: "btn btn-primary",
          type: "button",
          onclick: () => {
            store.dispatch({ type: SET_GAME_PHASE, payload: "voting" });
          },
        }, ["Votar a un jugador"]),
        el("button", {
          class: "btn btn-secondary",
          type: "button",
          onclick: () => {
            if (confirm("¿Salir de la partida? Se perderá el progreso.")) {
              store.dispatch({ type: RESET_GAME });
              onNavigate("/");
            }
          },
        }, ["Salir"]),
      ]),
    ]);
    return { title: "Inicio del juego", subtitle: "Turno inicial", content };
  }

  if (gamePhase === "voting") {
    const votedPlayers = state.game.votedPlayers || [];
    const availablePlayers = players.filter((p, index) => !votedPlayers.includes(index));
    const playerButtons = availablePlayers.map((p) => {
      const playerIndex = players.indexOf(p);
      return el("button", {
        class: "btn btn-player",
        type: "button",
        onclick: () => {
          store.dispatch({ type: VOTE_PLAYER, payload: playerIndex });
        },
      }, [p.label]);
    });
    const noPlayersMessage =
      availablePlayers.length === 0
        ? el("p", {
            class: "p",
            style: "text-align: center; color: var(--muted); margin: 20px 0;",
          }, ["Todos los jugadores ya han sido votados"])
        : null;
    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¿Quién es el impostor?" }),
      el("p", { class: "p", text: "Selecciona al jugador que crees que es el impostor:" }),
      el("div", { class: "player-list" }, playerButtons),
      noPlayersMessage,
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-secondary",
          type: "button",
          onclick: () => {
            store.dispatch({ type: SET_GAME_PHASE, payload: "start" });
          },
        }, ["Cancelar"]),
      ]),
    ]);
    return { title: "Votación", subtitle: "Elige al impostor", content };
  }

  if (gamePhase === "vote-result") {
    const votedPlayer = state.game.votedPlayer;
    const isImpostor = votedPlayer.role === "impostor";
    const colorStyle = "text-align: center; font-size: 16px; color: " + (isImpostor ? "var(--accent-2)" : "var(--danger)");
    const content = el("div", {}, [
      el("h1", { class: "h1", text: isImpostor ? "¡Correcto!" : "¡Incorrecto!" }),
      el("div", { class: "card" }, [
        el("p", {
          class: "p",
          style: "text-align: center; font-size: 18px; margin: 20px 0;",
        }, [`${votedPlayer.label} ${isImpostor ? "SÍ" : "NO"} era el impostor`]),
        el("p", { class: "p", style: colorStyle }, [
          isImpostor ? "🎉 ¡Buena deducción!" : "😅 ¡Sigue intentando!",
        ]),
      ]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-danger",
          type: "button",
          onclick: () => {
            if (confirm("¿Revelar impostores? Esto terminará el juego.")) {
              store.dispatch({ type: REVEAL_IMPOSTORS });
            }
          },
        }, ["Revelar impostores"]),
        el("button", {
          class: "btn btn-primary",
          type: "button",
          onclick: () => {
            store.dispatch({ type: SET_GAME_PHASE, payload: "voting" });
          },
        }, ["Votar a un jugador"]),
        el("button", {
          class: "btn btn-secondary",
          type: "button",
          onclick: () => {
             const word = pickRandomWord(store.getState().categories, store.getState().game.categoryIds);
             if (!word) alert("No se pudo elegir una palabra");
             else store.dispatch({ type: START_GAME, payload: { word } });
          },
        }, ["Seguir jugando"]),
      ]),
    ]);
    return {
      title: "Resultado de votación",
      subtitle: isImpostor ? "¡Acertaste!" : "¡Fallaste!",
      content,
    };
  }

  if (gamePhase === "reveal") {
    const impostors = players.filter((p) => p.role === "impostor");
    const content = el("div", {}, [
      el("h1", { class: "h1", text: "¡Revelar impostores!" }),
      el("p", { class: "p", text: `La palabra era: ${displayWord}` }),
      el("div", { class: "section" }, [
        el("div", { class: "section-header" }, [
          el("span", { text: "🕵️‍♀️" }),
          el("h2", { class: "section-title", text: "IMPOSTORES" }),
        ]),
        el(
          "div",
          { class: "category-list" },
          impostors.map((impostor) =>
            el("div", { class: "impostor-item" }, [
              el("span", { text: "🎭" }),
              el("span", { text: impostor.label }),
            ])
          )
        ),
      ]),
      el("div", { class: "actions" }, [
        el("button", {
          class: "btn btn-primary",
          type: "button",
          onclick: () => {
            store.dispatch({ type: RESET_GAME });
            onNavigate("/");
          },
        }, ["Nueva partida"]),
        el("button", {
          class: "btn btn-secondary",
          type: "button",
          onclick: () => {
            store.dispatch({ type: RESET_GAME });
            onNavigate("/");
          },
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
              el("p", { class: "p", text: "¿Listo para revelar? (Mantén presionado para ver)" }),
            ]),
          ]),
        ]),
        el("div", {
          class: `flip-card-back ${player.role === "impostor" ? "impostor" : ""}`,
        }, [
          el("div", { class: "card-content" }, [
            el("h2", {
              class: "h2",
              text: player.role === "impostor" ? "🎭 IMPOSTOR" : `🎯 ${displayWord}`,
            }),
            el("p", {
              class: "p",
              text:
                player.role === "impostor"
                  ? "Tu objetivo es hacer que los demás adivinen mal"
                  : `Tu palabra es: ${displayWord}`,
            }),
          ]),
        ]),
      ]),
    ]),
  ]);

  const revealArea = el("div", { class: "reveal-area" }, [content]);

  const refreshReveal = () => {
    const flipCard = revealArea.querySelector(".flip-card");
    const handleReveal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      flipCard.classList.add("flipped");
    };
    const handleHide = (e) => {
      e.preventDefault();
      e.stopPropagation();
      flipCard.classList.remove("flipped");
      if (!player.revealed && (e.type === "mouseup" || e.type === "touchend")) {
        store.dispatch({ type: REVEAL_CURRENT_PLAYER });
      }
    };
    flipCard.addEventListener("mousedown", handleReveal);
    flipCard.addEventListener("touchstart", handleReveal);
    flipCard.addEventListener("mouseup", handleHide);
    flipCard.addEventListener("touchend", handleHide);
    flipCard.addEventListener("mouseleave", () => flipCard.classList.remove("flipped"));

    if (player.revealed) {
      const isLastPlayer = currentPlayerIndex === players.length - 1;
      const nextBtn = el(
        "button",
        {
          class: "btn btn-primary",
          type: "button",
          style: "margin-top: 12px;",
          onclick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window._isNextRunning) return;
            window._isNextRunning = true;
            if (isLastPlayer) {
              store.dispatch({ type: FINISH_REVEAL_PHASE });
            } else {
              store.dispatch({ type: NEXT_PLAYER });
              const currentSt = store.getState();
              if (currentSt.game.currentPlayerIndex >= players.length) onNavigate("/round-end");
            }
            setTimeout(() => {
              window._isNextRunning = false;
            }, 600);
          },
        },
        [isLastPlayer ? "Iniciar juego" : "Siguiente jugador"]
      );
      revealArea.append(nextBtn);
    }
  };
  refreshReveal();

  revealArea.append(
    el("button", {
      class: "btn btn-secondary",
      type: "button",
      onclick: () => {
        if (confirm("¿Salir de la partida? Se perderá el progreso.")) {
          store.dispatch({ type: RESET_GAME });
          onNavigate("/");
        }
      },
    }, ["Salir"])
  );

  return { title: "Tu turno", subtitle: player.label, content: revealArea };
}
