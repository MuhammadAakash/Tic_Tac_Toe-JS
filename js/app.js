import View from "./view.js ";
import Store from "./store.js";

const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
];

function init() {
  const view = new View();
  const store = new Store("game-storage-key", players);

  function initView() {
    view.closeAll();
    view.clearMoves();
    view.setToggleIndicator(store.game.currentPlayer);
    view.updateScoreboard(
      store.stats.playerWithStats[0].wins,
      store.stats.playerWithStats[1].wins,
      store.stats.ties
    );
    view.initializeMoves(store.game.moves);
  }

  window.addEventListener("storage", () => {
    initView();
  });
  initView();
  view.bindGameResetEvent((event) => {
    store.resetGame();
    initView();
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();

    initView();
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );
    if (existingMove) return;
    view.handlePlayerMove(square, store.game.currentPlayer);
    store.playerMove(+square.id);

    if (store.game.status.isCompleted) {
      view.openModel(
        store.game.status.winner
          ? `${store.game.status.winner.name} wins!`
          : `Tie Game`
      );
      return;
    }
    view.setToggleIndicator(store.game.currentPlayer);
  });
}

window.addEventListener("load", init);
