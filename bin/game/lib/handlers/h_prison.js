var constants = require('../../../constants');

// Помещаем игрока в темницу
module.exports = function(game) {
  return function(timer, uid) {
    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      // Помещаем тукущего игрока в темницу
      for(var item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        game._prisoner = game._activePlayers[item];
      }

      game._actionsCount = 0;

      // Переходим к волчку
      game._handlers[constants.G_START](false);
    }
  }
};






