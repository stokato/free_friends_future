var constants = require('../../constants');

var startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits');

// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function (timer) {
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      var result = { complete: true };

      var item, player;
      for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        player = game.gActivePlayers[item];
        break;
      }

      game.emit(player.getSocket(), result);

      game.gNextGame = constants.G_SYMPATHY_SHOW;

      game.gStoredOptions = game.gActionsQueue;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      activateAllPlayers(game.gRoom, game.gActivePlayers);

      setActionsLimit(game, constants.PLAYERS_COUNT -1);
      game.gActionsCount = constants.PLAYERS_COUNT * (constants.PLAYERS_COUNT -1);

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};