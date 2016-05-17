var GameError = require('./../../../game_error'),
  checkInput = require('./../../../check_input');
var constants = require('../../constants');

var startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
  getPlayersID = require('../get_players_id'),
    setActionsLimit = require('../set_action_limits'),
  randomPlayer = require('../random_player');

var constants_io = require('../../../io/constants');

// Карты, ждем, кода все ответят, потом показываем всем их ответы и где золото
module.exports = function(game) {
  return function (timer) {
    var f = constants_io.FIELDS;
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      var result = {};
      result[f.picks] = [];
      result[f.gold] = Math.floor(Math.random() * constants.CARD_COUNT);


      var item, player, picks;
      for (item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {

        player = game.gActivePlayers[item];
        picks = game.gActionsQueue[player.getID()];

        if(picks) {
          var pick = {};
          pick[f.id] = player.getID();
          pick[f.vid] = player.getVID();
          pick[f.pick] = picks[0][f.pick];
          result.picks.push(pick);
        }

      }

      game.gNextGame = constants.G_LOT;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      activateAllPlayers(game.gRoom, game.gActivePlayers);

      setActionsLimit(game, 1);
      game.gActionsCount = constants.PLAYERS_COUNT;

      //result[f.next_game] = game.gNextGame;
      ////result[f.players] = getPlayersID(game.gActivePlayers);
      //
      //var nextPlayer = randomPlayer(game.gRoom, null);
      //result[f.players] = [{id: nextPlayer.getID(), vid: nextPlayer.getVID()}];
      //
      //game.emit(player.getSocket(), result);
      //game.gameState = result;

      game.restoreGame();

     /// game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};
