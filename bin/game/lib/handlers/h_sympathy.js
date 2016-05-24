var constants = require('../../constants');
var constants_io = require('../../../io/constants');

var startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    getPlayersID = require('../get_players_id'),
    setActionsLimit = require('../set_action_limits'),
    randomPlayer = require('../random_player'),
    GameError = require('./../../../game_error');


// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function (timer, uid, options) {
    var f = constants_io.FIELDS;

    // Если все ответили или истеколо время - переходим к следующему этапу
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      var result = {}; // complete: true
      //result[f.game] = constants.G_SYMPATHY;

      //var item, player;
      //for(item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
      //  player = game.gActivePlayers[item];
      //  break;
      //}

      //game.emit(player.getSocket(), result);

      game.gNextGame = constants.G_SYMPATHY_SHOW;

      // Сохраняем выбор игроков
      game.gStoredOptions = game.gActionsQueue;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      activateAllPlayers(game.gRoom, game.gActivePlayers);

      setActionsLimit(game, constants.PLAYERS_COUNT -1);
      game.gActionsCount = (game.gRoom.girls_count + game.gRoom.guys_count) * 10; //constants.PLAYERS_COUNT * (constants.PLAYERS_COUNT -1);

      result[f.next_game] = game.gNextGame;
      result[f.players] = getPlayersID(game.gActivePlayers);

      // Отправляем всем
      var player = randomPlayer(game.gRoom, null);
      if(!player) {
        return game.stop();
      }
      game.emit(player.getSocket(), result);

      // Сохраняем состояние игры
      game.gameState = result;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);
    }
  }
};