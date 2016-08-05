var constants = require('../../constants');
//var constants_io = require('../../../io/constants');

var startTimer   = require('../start_timer'),
    activateAllPlayers = require('../activate_all_players'),
    getPlayersID = require('../get_players_id'),
    setActionsLimit = require('../set_action_limits'),
    randomPlayer = require('../random_player'),
    getPrison = require('../get_prison'),
    GameError = require('./../../../game_error');
var checkCountPlayers = require('./../check_count_players');


// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function (timer) {
    //var f = constants_io.FIELDS;

    // Если все ответили или истеколо время - переходим к следующему этапу
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!checkCountPlayers(game)) {
        return game.stop();
      }

      game.gNextGame = constants.G_SYMPATHY_SHOW;

      // Сохраняем выбор игроков
      game.gStoredOptions = game.gActionsQueue;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      activateAllPlayers(game.gRoom, game.gActivePlayers, null, game.gPrisoner);

      setActionsLimit(game, game.gRoom.girls_count + game.gRoom.guys_count -1);

      var countPrisoners = (game.gPrisoner === null)? 0 : 1;
      game.gActionsCount = (game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners) * 10; //constants.PLAYERS_COUNT * (constants.PLAYERS_COUNT -1);

      var result = {}; // complete: true
      result.next_game = game.gNextGame;
      result.players = getPlayersID(game.gActivePlayers);
      result.prison = null;
      if(game.gPrisoner !== null) {
        result.prison = {
          id : game.gPrisoner.id,
          vid: game.gPrisoner.vid,
          sex: game.gPrisoner.sex
        }
      }

      // Отправляем всем
      var player = randomPlayer(game.gRoom, null, [], game.gPrisoner);
      if(!player) {
        return game.stop();
      }
      game.emit(player.getSocket(), result);

      // Сохраняем состояние игры
      game.gameState = result;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT_GAME);
    }
  }
};