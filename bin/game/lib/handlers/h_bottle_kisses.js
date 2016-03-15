
var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (timer, uid, options) {

    if(uid) {
      var player = game.gActivePlayers[uid];

      var result = { id: uid, pick: options.pick };
      game.emit(player.getSocket(), result);
    }

    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      game.gNextGame = constants.G_START;

      game.gActionsQueue = {};
      game.gActivePlayers = {};

      pushAllPlayers(game.gRoom, game.gActivePlayers);
      setActionsLimit(game, 1);
      game.gActionsCount = constants.PLAYERS_COUNT;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};