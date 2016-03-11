var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players');

module.exports = function(game) {
  return function(timer, id, options) { // Лучший, сообщаем всем их выбор
    if (!checkInput('game_best', game.gSocket, game.userList, options)) {
      game.stop();
      return new GameError(socket, "GAMEBEST", "Верификация не пройдена");
    }

    var result = {};

    if(!game.gRoom.guys(options.pick) && !game.gRoom.girls(options.pick)) {
      game.stop();
      return new GameError(game.gSocket, 'GAMEBEST', "Неверные аргументы: такого пользователя нет в игре");
    }

    result['pick'] = { id : id, pick : options.pick};
    game.emit(result);

    if(game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      game.nextGame = 'start';
      game.currPlayers = {};
      pushAllPlayers(game.gRoom, currPlayers);
      game.actionsQueue = {};
      game.countActions = constants.PLAYERS_COUNT;

      game.currTimer = startTimer(game.handlers[game.nextGame]);
    }
  }
};