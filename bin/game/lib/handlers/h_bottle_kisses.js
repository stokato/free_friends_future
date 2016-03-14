
var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players'),
    setAnswersLimit = require('../set_answers_limits');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (socket, timer, id, options) {

    if(id) {
      var player = game.currPlayers[id];
      //if (!checkInput('game_bottle_kisses', player.getSocket(), game.userList, options)) {
      //  game.stop();
      //  return new GameError(player.getSocket(), "GAMEBOTTLE", "Верификация не пройдена");
      //}

      var result = {};
      result['kiss'] = {id: id, pick: options.pick};
      game.emit(player.getSocket(), result);
    }

    if (game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      game.nextGame = 'start';
      game.actionsQueue = {};
      game.currPlayers = {};
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, 1);

      game.countActions = constants.PLAYERS_COUNT;
      game.currTimer = startTimer(game.handlers[game.nextGame]);
    }
  }
};