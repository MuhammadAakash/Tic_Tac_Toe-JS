const initialValue = {
  currentGameMoves: [],
  history: {
    currentRoundGame: [],
    allGames: [],
  },
};

export default class Store {
  #state = initialValue;
  constructor(key, players) {
    this.storageKey = key;
    this.players = players;
  }

  get stats() {
    const state = this.#getState();

    return {
      playerWithStats: this.players.map((player) => {
        const wins = state.history.currentRoundGame.filter(
          (game) => game.status.winner?.id === player.id
        ).length;
        return {
          ...player,
          wins,
        };
      }),
      ties: state.history.currentRoundGame.filter(
        (game) => game.status.winner == null
      ).length,
    };
  }

  get game() {
    const state = this.#getState();

    const currentPlayer = this.players[state.currentGameMoves.length % 2];

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    for (const player of this.players) {
      const selectedPlayer = state.currentGameMoves
        .filter((move) => move.player.id === player.id)
        .map((move) => move.squareId);

      for (const pattern of winningPatterns) {
        if (pattern.every((v) => selectedPlayer.includes(v))) {
          winner = player;
        }
      }
    }

    return {
      moves: state.currentGameMoves,
      currentPlayer,
      status: {
        isCompleted: winner != null || state.currentGameMoves.length === 9,
        winner,
      },
    };
  }

  playerMove(squareId) {
    const stateCloned = structuredClone(this.#getState());

    stateCloned.currentGameMoves.push({
      squareId,
      player: this.game.currentPlayer,
    });

    this.#saveState(stateCloned);
  }

  resetGame() {
    const stateCloned = structuredClone(this.#getState());

    const { moves, status } = this.game;
    if (status.isCompleted) {
      stateCloned.history.currentRoundGame.push({
        moves,
        status,
      });
    }
    stateCloned.currentGameMoves = [];
    this.#saveState(stateCloned);
  }
  newRound() {
    this.resetGame();
    const stateCloned = structuredClone(this.#getState());
    stateCloned.history.allGames.push(...stateCloned.history.currentRoundGame);
    stateCloned.history.currentRoundGame = [];
    this.#saveState(stateCloned);
  }
  #getState() {
    const item = window.localStorage.getItem(this.storageKey);
    return item ? JSON.parse(item) : initialValue;
  }

  #saveState(stateOrFn) {
    const prevState = this.#getState();

    let newState;

    switch (typeof stateOrFn) {
      case "function":
        newState = stateOrFn();
        break;
      case "object":
        newState = stateOrFn;
        break;
      default:
        throw new Error("Invalid argument passed to saveState");
    }
    window.localStorage.setItem(this.storageKey, JSON.stringify(newState));
  }
}
