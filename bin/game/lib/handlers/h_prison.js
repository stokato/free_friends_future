var constants = require('../../../constants');

// Помещаем игрока в темницу
module.exports = function(game) {
  return function(timer, uid) {
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      // Помещаем тукущего игрока в темницу
      for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        game.gPrisoner = game.gActivePlayers[item];
      }

      game.gActionsCount = 0;

      // Переходим к волчку
      game.gHandlers[constants.G_START](false);
    }
  }
};






