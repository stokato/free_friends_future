var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input');
var constants = require('../../constants');

//var //startTimer   = require('../start_timer'),
   // activateAllPlayers = require('../activate_all_players'),
  //getPlayersID = require('../get_players_id'),
    //setActionsLimit = require('../set_action_limits'),
  //randomPlayer = require('../random_player');

//var constants_io = require('../../../io/constants');

// Карты, ждем, кода все ответят, потом показываем всем их ответы и где золото
module.exports = function(game) {
  return function (timer) {
    //var f = constants_io.FIELDS;
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

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
