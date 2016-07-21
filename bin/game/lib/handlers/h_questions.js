var constants = require('../../constants');
var constants_io = require('../../../io/constants');

//var randomPlayer = require('../random_player');
    //startTimer   = require('../start_timer'),
   // activateAllPlayers = require('../activate_all_players'),
    //getPlayersID = require('../get_players_id'),
   // setActionsLimit = require('../set_action_limits');

// Вопросы, ждем, когда все ответят, потом показываем всем ответы
module.exports = function(game) {
  return function(timer) {
    var f = constants_io.FIELDS;
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      var result = {}, isPicks = false;
      result[f.picks] = [];
      //result[f.game] = constants.G_QUESTIONS;

      var item, playerInfo;
      for (item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        playerInfo = game.gActivePlayers[item];
        var picks = game.gActionsQueue[playerInfo.id];

        if(picks) {
          var pick = {};
          pick[f.id] = playerInfo.id;
          pick[f.vid] = playerInfo.vid;
          pick[f.pick] = picks[0][f.pick];
          result.picks.push(pick);
          isPicks = true;
        }
      }

      game.restoreGame(result, true);
    }
  }
};