var constants = require('../../constants');
var constants_io = require('../../../io/constants');

var randomPlayer = require('../random_player'),
    getPlayersID = require('../get_players_id'),
    startTimer   = require('../start_timer'),
    setActionsLimit = require('../set_action_limits'),
  //getPlayerInfo  = require('./../get_player_info'),
  getNextPlayer = require('./../get_next_player');

// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(game) {
  return function(timer) {
    var f = constants_io.FIELDS;
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      var player = randomPlayer(game.gRoom, null);
      if(!player) {
        return game.stop();
      }

      game.gNextGame = constants.G_LOT;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      // Получаем следующего игрока, если он в тюрьме, то передаем ход дальше, а его выпускаем
      // либо передаем ход ему
      var nextPlayerInfo = null;
      var isPlayer = false;
      while(!isPlayer) {
        setPlayer(nextPlayerInfo);
        if(!game.gPrisoners[nextPlayerInfo.id]) {
          isPlayer = true;
        } else {
          game.gPrisoners[nextPlayerInfo.id] = null;
        }
      }

      //game.gActivePlayers[player.getID()] = getPlayerInfo(player);

      game.gActivePlayers[nextPlayerInfo.id] = nextPlayerInfo;

      setActionsLimit(game, 1);
      game.gActionsCount = 1;

      var result = {  }; //players: getPlayersID(game.gActivePlayers)
      result[f.next_game] = game.gNextGame;
      result[f.players] = getPlayersID(game.gActivePlayers);
      //result[f.game] = constants.G_START;

      game.emit(player.getSocket(), result);
      game.gameState = result;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame]);

      //-------------------
      function setPlayer (nextPlayerInfo) {
        if(game.currentSex == constants_io.GIRL) { // девочка
          nextPlayerInfo = getNextPlayer(game.gRoom, game.guysIndex, true);
          game.guysIndex = nextPlayerInfo.index;
        } else { // мальчик
          nextPlayerInfo = getNextPlayer(game.gRoom, game.girlsIndex, false);
          game.girlsIndex = nextPlayerInfo.index;
        }
        game.currentSex = nextPlayerInfo.sex;
      }
    }
  }
};