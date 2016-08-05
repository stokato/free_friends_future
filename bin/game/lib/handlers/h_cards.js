var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input'),
  checkCountPlayers = require('./../check_count_players');
var constants = require('../../constants');

// Карты, ждем, кода все ответят, потом показываем всем их ответы и где золото
module.exports = function(game) {
  return function (timer) {

    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!checkCountPlayers(game)) {
        return game.stop();
      }

      var result = {};
      result.picks = [];
      result.gold = Math.floor(Math.random() * constants.CARD_COUNT);


      var item, playerInfo, picks;
      for (item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {

        playerInfo = game.gActivePlayers[item];
        picks = game.gActionsQueue[playerInfo.id];

        if(picks) {
          var pick = {};
          pick.id = playerInfo.id;
          pick.vid = playerInfo.vid;
          pick.pick = picks[0]["pick"];
          result.picks.push(pick);
        }

      }

      game.restoreGame(result, true);
    }
  }
};
