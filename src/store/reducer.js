import { initialState } from "./initialState.js";
import * as actions from "./actions.js";
import { assignRoles } from "../game/engine.js";

export function reducer(state = initialState, action) {
  switch (action.type) {
    case actions.HYDRATE_STATE:
      return {
        ...state,
        settings: { ...state.settings, ...(action.payload.settings || {}) },
        categories: action.payload.categories || state.categories,
        game: { ...state.game, ...(action.payload.game || {}) },
      };

    case actions.SET_ROUTE:
      return {
        ...state,
        lastRoute: state.route,
        route: action.payload,
      };

    case actions.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case actions.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
      };

    case actions.ADD_CATEGORY:
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };

    case actions.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c
        ),
      };

    case actions.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        game: {
          ...state.game,
          categoryIds: state.game.categoryIds.filter((id) => id !== action.payload),
        },
      };

    case actions.SET_GAME_DRAFT:
      return {
        ...state,
        game: { ...state.game, ...action.payload },
      };

    case actions.UPDATE_PLAYER_COUNT: {
      const newCount = action.payload;
      const newNames = [...state.game.playerNames];
      while (newNames.length < newCount) {
        newNames.push(`Jugador ${newNames.length + 1}`);
      }
      return {
        ...state,
        game: {
          ...state.game,
          playerCount: newCount,
          playerNames: newNames.slice(0, newCount),
          impostorCount: Math.min(state.game.impostorCount, Math.floor(newCount / 2)),
        },
      };
    }

    case actions.UPDATE_IMPOSTOR_COUNT:
      return {
        ...state,
        game: { ...state.game, impostorCount: action.payload },
      };

    case actions.UPDATE_PLAYER_NAME: {
      const { index, name } = action.payload;
      const newNames = [...state.game.playerNames];
      newNames[index] = name;
      return {
        ...state,
        game: { ...state.game, playerNames: newNames },
      };
    }

    case actions.TOGGLE_CATEGORY: {
      const categoryId = action.payload;
      const isSelected = state.game.categoryIds.includes(categoryId);
      return {
        ...state,
        game: {
          ...state.game,
          categoryIds: isSelected
            ? state.game.categoryIds.filter((id) => id !== categoryId)
            : [...state.game.categoryIds, categoryId],
        },
      };
    }

    case actions.START_GAME: {
      const { word } = action.payload;
      const roles = assignRoles(state.game.playerCount, state.game.impostorCount);
      const players = roles.map((role, idx) => ({
        index: idx,
        label: state.game.playerNames[idx] || `Jugador ${idx + 1}`,
        role,
        revealed: false,
      }));
      return {
        ...state,
        game: {
          ...state.game,
          status: "playing",
          players,
          currentWord: word,
          revealed: false,
          currentPlayerIndex: 0,
          gamePhase: "playing",
          startShown: true,
          votedPlayers: [],
          votedPlayer: null,
        },
      };
    }

    case actions.REVEAL_CURRENT_PLAYER: {
      const newPlayers = [...state.game.players];
      newPlayers[state.game.currentPlayerIndex] = {
        ...newPlayers[state.game.currentPlayerIndex],
        revealed: true,
      };
      return {
        ...state,
        game: {
          ...state.game,
          players: newPlayers,
          revealed: true,
        },
      };
    }

    case actions.FINISH_REVEAL_PHASE: {
      return {
        ...state,
        game: {
          ...state.game,
          currentPlayerIndex: 0,
          revealed: false,
          gamePhase: "start",
        },
      };
    }

    case actions.SET_GAME_PHASE: {
      return {
        ...state,
        game: {
          ...state.game,
          gamePhase: action.payload,
        },
      };
    }

    case actions.NEXT_PLAYER: {
      const nextIdx = state.game.currentPlayerIndex + 1;
      const isFinished = nextIdx >= state.game.players.length;
      return {
        ...state,
        game: {
          ...state.game,
          currentPlayerIndex: isFinished ? state.game.players.length - 1 : nextIdx,
          revealed: false,
        },
      };
    }

    case actions.VOTE_PLAYER: {
      const playerIndex = action.payload;
      const votedPlayers = [...(state.game.votedPlayers || [])];
      if (!votedPlayers.includes(playerIndex)) votedPlayers.push(playerIndex);
      return {
        ...state,
        game: {
          ...state.game,
          votedPlayers,
          votedPlayer: state.game.players[playerIndex],
          gamePhase: "vote-result",
        },
      };
    }

    case actions.REVEAL_IMPOSTORS:
      return {
        ...state,
        game: { ...state.game, gamePhase: "reveal" },
      };

    case actions.RESET_GAME:
      return {
        ...state,
        game: {
          ...initialState.game,
          playerCount: state.game.playerCount,
          impostorCount: state.game.impostorCount,
          playerNames: [...state.game.playerNames],
          categoryIds: [...state.game.categoryIds],
          status: "draft",
        },
      };

    default:
      return state;
  }
}
