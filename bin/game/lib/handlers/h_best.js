var GameError = require('./../../../game_error');
var constants = require('../../constants');

var startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    setActionsLimit = require('../set_action_limits');

module.exports = function(game) {
  return function(timer, id, options) { // Лучший, сообщаем всем их выбор
    if(id) {
      var player = game.gActivePlayers[id];

      var result = {};

      if(!game.gStoredOptions[options.pick]) { // Если нет такого пользоателя среди кандидатов
        game.stop();
        return new GameError(player.getSocket(), 'GAMEBEST',
          "Неверные аргументы: за пользователя с таким ИД нельзя проголосовать");
      }

      result['pick'] = { id : id, pick : options.pick};

      game.emit(player.getSocket(), result);
    }

    if(game.gActionsCount == 0 || timer) { // После голосования
      if(!timer) { clearTimeout(game.gTimer); }

      game.gNextGame = constants.G_START;
      game.gActivePlayers = {};
      game.gActionsQueue = {};
      activateAllPlayers(game.gRoom, game.gActivePlayers);

      setActionsLimit(game, 1);
      game.gActionsCount = constants.PLAYERS_COUNT;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};