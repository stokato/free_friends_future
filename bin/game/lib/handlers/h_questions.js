var constants = require('../../constants');
var checkCountPlayers = require('./../check_count_players');
//var constants_io = require('../../../io/constants');

//var randomPlayer = require('../random_player');
    //startTimer   = require('../start_timer'),
   // activateAllPlayers = require('../activate_all_players'),
    //getPlayersID = require('../get_players_id'),
   // setActionsLimit = require('../set_action_limits');

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
      //result[f.game] = constants.G_QUESTIONS;

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