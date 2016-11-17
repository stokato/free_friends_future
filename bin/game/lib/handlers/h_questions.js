// Вопросы, ждем, когда все ответят, потом показываем ответы
module.exports = function(game) {
  return function(timer) {
    if(game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      var result = {
        picks : []
      };

      var playerInfo, picks;
      for (var item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        playerInfo = game._activePlayers[item];
        picks = game._actionsQueue[playerInfo.id];

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