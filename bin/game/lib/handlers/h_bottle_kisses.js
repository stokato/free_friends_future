
var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits');

var constants_io = require('../../../io/constants');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (timer, uid, options) {
    var f = constants_io.FIELDS;
    if(uid) {
      var player = game.gActivePlayers[uid];

      var result = {};
      result[f.id] = uid;
      result[f.pick] = options[f.pick];
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