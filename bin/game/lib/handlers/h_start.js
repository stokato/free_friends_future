var constants     = require('../../constants');
var constants_io  = require('../../../io/constants');

var randomPlayer        = require('../random_player'),
    getPlayersID        = require('../get_players_id'),
    startTimer          = require('../start_timer'),
    setActionsLimit     = require('../set_action_limits'),
    getNextPlayer       = require('./../get_next_player'),
    isPlayerInRoom      = require('./../is_player_in_room'),
    checkCountPrisoners = require('./../check_count_players');

// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(game) {
  return function(timer) {
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!checkCountPrisoners(game)) {
        return game.stop();
      }

      var player = randomPlayer(game.gRoom, null, [], game.gPrisoner);

      game.gNextGame = constants.G_LOT;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      var prisonerId = (game.gPrisoner === null)? null : game.gPrisoner.id;

    if(!isPlayerInRoom(game.gRoom, prisonerId)) {
      game.gPrisoner = null;
    }

      // Получаем следующего игрока, если он в тюрьме, то передаем ход дальше, а его выпускаем
      // либо передаем ход ему
      var nextPlayerInfo = null;
      var isPlayer = false;
      while(!isPlayer) {
        nextPlayerInfo = setPlayer();
        if(!game.gPrisoner || game.gPrisoner.id != nextPlayerInfo.id) {
          isPlayer = true;
        } else {
          game.gPrisoner = null;
        }
      }

      game.gActivePlayers[nextPlayerInfo.id] = nextPlayerInfo;

      setActionsLimit(game, 1);
      game.gActionsCount = 1;

      var result = {  }; //players: getPlayersID(game.gActivePlayers)
      result.next_game = game.gNextGame;
      result.players = getPlayersID(game.gActivePlayers);
      //result[f.game] = constants.G_START;

      result.prison = null;
      if(game.gPrisoner !== null) {
        result.prison = {
          id : game.gPrisoner.id,
          vid: game.gPrisoner.vid,
          sex: game.gPrisoner.sex
        }
      }

      game.emit(player.getSocket(), result);
      game.gameState = result;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT_LOT);

      //-------------------
      function setPlayer () {
        if(game.currentSex == constants_io.GIRL) { // девочка
          var nextPlayerInfo = getNextPlayer(game.gRoom, game.guysIndex, true);
          game.guysIndex = nextPlayerInfo.index;
        } else { // мальчик
          nextPlayerInfo = getNextPlayer(game.gRoom, game.girlsIndex, false);
          game.girlsIndex = nextPlayerInfo.index;
        }
        game.currentSex = nextPlayerInfo.sex;
        return nextPlayerInfo;
      }
    }
  }
};