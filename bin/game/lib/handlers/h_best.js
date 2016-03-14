var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players'),
    setAnswersLimit = require('../set_answers_limits');

module.exports = function(game) {
  return function(socket, timer, id, options) { // Лучший, сообщаем всем их выбор
    if(id) {
      var player = game.currPlayers[id];
      //if (!checkInput('game_best', player.getSocket(), game.userList, options)) {
      //  game.stop();
      //  return new GameError(player.getSocket(), "GAMEBEST", "Верификация не пройдена");
      //}

      var result = {};

      if(!game.storedOptions[options.pick]) {
        game.stop();
        return new GameError(player.getSocket(), 'GAMEBEST',
          "Неверные аргументы: за пользователя с таким ИД нельзя проголосовать");
      }

      result['pick'] = { id : id, pick : options.pick};

      game.emit(socket, result);
    }

    if(game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      game.nextGame = 'start';
      game.currPlayers = {};
      pushAllPlayers(game.gRoom, game.currPlayers);
      setAnswersLimit(game, 1);
      game.actionsQueue = {};
      game.countActions = constants.PLAYERS_COUNT;

      game.currTimer = startTimer(game.pSocket, game.handlers[game.nextGame]);
    }
  }
};