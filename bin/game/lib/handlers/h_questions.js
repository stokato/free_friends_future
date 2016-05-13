var constants = require('../../constants');
var constants_io = require('../../../io/constants');

var startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    getPlayersID = require('../get_players_id'),
    setActionsLimit = require('../set_action_limits');

// Вопросы, ждем, когда все ответят, потом показываем всем ответы
module.exports = function(game) {
  return function(timer) {
    var f = constants_io.FIELDS;
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      var result = {}, isPicks = false;
      result[f.picks] = [];
      //result[f.game] = constants.G_QUESTIONS;

      var item, player;
      for (item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        player = game.gActivePlayers[item];
        var picks = game.gActionsQueue[player.getID()];

        if(picks) {
          var pick = {};
          pick[f.id] = player.getID();
          pick[f.pick] = picks[0][f.pick];
          result.picks.push(pick);
          isPicks = true;
        }
      }

      if(isPicks) {
        game.emit(player.getSocket(), result);
      }


      game.gNextGame = constants.G_START;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      activateAllPlayers(game.gRoom, game.gActivePlayers);

      setActionsLimit(game, 1);
      game.gActionsCount = constants.PLAYERS_COUNT;

      result[f.next_game] = game.gNextGame;
      result[f.players] = getPlayersID(game.gActivePlayers);

      game.emit(player.getSocket(), result);
      game.gameState = result;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};