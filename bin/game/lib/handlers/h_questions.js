var PF = require('./../../../constants').PFIELDS;

// Вопросы, ждем, когда все ответят, потом показываем ответы
module.exports = function(game) {
  return function(timer) {
    if(game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      var result = {};
      result[PF.PICKS] = [];

      var playerInfo, picks;
      for (var item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        playerInfo = game._activePlayers[item];
        picks = game._actionsQueue[playerInfo.id];

        if(picks) {
          var pick = {};
          pick[PF.ID] = playerInfo.id;
          pick[PF.VID] = playerInfo.vid;
          pick[PF.PICK] = picks[0][PF.PICK];
          
          result[PF.PICKS].push(pick);
        }
      }

      game.restoreGame(result, true);
    }
  }
};