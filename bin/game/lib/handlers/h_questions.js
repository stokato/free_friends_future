var constants = require('../../constants');

var startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits');

// Вопросы, ждем, когда все ответят, потом показываем всем ответы
module.exports = function(game) {
  return function(timer) {
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      var result = { picks : [] };
      var item, player;
      for (item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        player = game.gActivePlayers[item];
        var picks = game.gActionsQueue[player.getID()];

        if(picks) {
          result.picks.push({ id : player.getID(), pick : picks[0].pick });
        }
      }

      game.emit(player.getSocket(), result);

      game.gNextGame = constants.G_START;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      activateAllPlayers(game.gRoom, game.gActivePlayers);

      setActionsLimit(game, 1);
      game.gActionsCount = constants.PLAYERS_COUNT;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};