var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer');
// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(game) {
  return function(timer) {
    if (game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      var player = randomPlayer(game.gRoom, null);
      game.currPlayers = {};
      game.currPlayers[player.getID()] = player;
      game.actionsQueue = {};

      game.countActions = 1;
      game.nextGame = 'lot';

      var options = { players: getPlayersID(game.currPlayers) };
      game.emit(options);
      game.currTimer = startTimer(game.handlers[game.nextGame]);
    }
  }
};