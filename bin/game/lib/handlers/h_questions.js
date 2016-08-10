var constants = require('../../constants');
var checkCountPlayers = require('./../check_count_players');


// Вопросы, ждем, когда все ответят, потом показываем всем ответы
module.exports = function(game) {
  return function(timer) {
    //var f = constants_io.FIELDS;
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!checkCountPlayers(game)) {
        return game.stop();
      }

      var result = {}, isPicks = false;
      result.picks = [];

      var item, playerInfo;
      for (item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        playerInfo = game.gActivePlayers[item];
        var picks = game.gActionsQueue[playerInfo.id];

        if(picks) {
          var pick = {};
          pick.id = playerInfo.id;
          pick.vid = playerInfo.vid;
          pick.pick = picks[0]["pick"];
          result.picks.push(pick);
          isPicks = true;
        }
      }

      game.restoreGame(result, true);
    }
  }
};