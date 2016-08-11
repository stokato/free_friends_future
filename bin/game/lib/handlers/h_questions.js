var constants = require('../../../constants');

// Вопросы, ждем, когда все ответят, потом показываем ответы
module.exports = function(game) {
  return function(timer) {
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      var result = {
        picks : []
      };

      var playerInfo, picks;
      for (var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        playerInfo = game.gActivePlayers[item];
        picks = game.gActionsQueue[playerInfo.id];

        if(picks) {
          result.picks.push({
            id    : playerInfo.id,
            vid   : playerInfo.vid,
            pick  : picks[0].pick
          });
        }
      }

      game.restoreGame(result, true);
    }
  }
};