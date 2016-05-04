var GameError = require('./../../../game_error');
var constants = require('../../constants');

var startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    getPlayersID = require('../get_players_id'),
    setActionsLimit = require('../set_action_limits');

var constants_io = require('../../../io/constants');

module.exports = function(game) {
  return function(timer, id, options) { // Лучший, сообщаем всем их выбор
    var f = constants_io.FIELDS;
    if(id) {
      var player = game.gActivePlayers[id];

      var result = {};

      if(!game.gStoredOptions[options[f.pick]]) { // Если нет такого пользоателя среди кандидатов
        game.stop();
        return new GameError(player.getSocket(), constants.G_BEST,
          "Неверные аргументы: за пользователя с таким ИД нельзя проголосовать");
      }

      //result[f.game] = constants.G_BEST;
      result[f.pick] = {};
      result[f.pick][f.id] = id;
      result[f.pick][f.pick] = options[f.pick];

      game.emit(player.getSocket(), result);

      if(!game.gameState[f.picks]) { game.gameState[f.picks] = []; }
      game.gameState[f.picks].push(result[f.pick]);

    }

    if(game.gActionsCount == 0 || timer) { // После голосования
      if(!timer) { clearTimeout(game.gTimer); }

      game.gNextGame = constants.G_START;
      game.gActivePlayers = {};
      game.gActionsQueue = {};
      activateAllPlayers(game.gRoom, game.gActivePlayers);

      setActionsLimit(game, 1);
      game.gActionsCount = constants.PLAYERS_COUNT;

      result = {};
      result[f.next_game] = game.gNextGame;
      result[f.players] = getPlayersID(game.gActivePlayers);

      //var item;
      //for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
      //  player = game.gActivePlayers[item];
      //  break;
      //}

      game.emit(player.getSocket(), result);
      game.gameState = result;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};