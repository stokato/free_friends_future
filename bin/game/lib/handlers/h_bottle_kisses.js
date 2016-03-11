
var GameError = require('./../../../game_error'),
    checkInput = require('./../../../check_input');
var constants = require('../../constants_game');

var startTimer   = require('../start_timer'),
    pushAllPlayers = require('../push_all_players');

// Бутылочка поцелуи, сообщаем всем выбор пары
module.exports = function(game) {
  return function (timer, id, options) {

    if (!checkInput('game_bottle_kisses', game.gSocket, game.userList, options)) {
      game.stop();
      return new GameError(socket, "GAMEBOTTLE", "Верификация не пройдена");
    }

    var result = {};
    result['kiss'] = {id: id, pick: options.kiss};
    game.emit(result);

    if (game.countActions == 0 || timer) {
      if(!timer) { clearTimeout(game.currTimer); }

      game.nextGame = 'start';
      game.actionsQueue = {};
      game.currPlayers = {};
      pushAllPlayers(game.gRoom, game.currPlayers);

      game.countActions = constants.PLAYERS_COUNT;
      game.currTimer = startTimer(game.handlers[game.nextGame]);
    }
  }
};