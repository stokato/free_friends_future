var constants = require('../../constants');
var constants_io = require('../../../io/constants');

var randomPlayer = require('../random_player'),
  getPlayersID = require('../get_players_id'),
  startTimer   = require('../start_timer'),
  setActionsLimit = require('../set_action_limits'),
  getNextPlayer = require('./../get_next_player');


module.exports = function(game) {
  return function(timer, uid) {
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      for(var item in game.gActivePlayers) if(game.gActivePlayers.hasOwnProperty(item)) {
        game.gPrisoner = game.gActivePlayers[item];
      }

      var player = randomPlayer(game.gRoom, null, [], game.gPrisoner);
      if(!player) {
        return game.stop();
      }

      game.gNextGame = constants.G_LOT;

      game.gActivePlayers = {};
      game.gActionsQueue = {};

      // Получаем следующего игрока, если он в тюрьме, то передаем ход дальше
      var nextPlayerInfo = null;
      var isPlayer = false;
      while(!isPlayer) {
        nextPlayerInfo = setPlayer();
        if(game.gPrisoner.id != nextPlayerInfo.id) {
          isPlayer = true;
        }
      }

      game.gActivePlayers[nextPlayerInfo.id] = nextPlayerInfo;

      setActionsLimit(game, 1);
      game.gActionsCount = 1;

      var result = {};
      result.next_game = game.gNextGame;
      result.players = getPlayersID(game.gActivePlayers);

      result.prison = {
        id : game.gPrisoner.id,
        vid: game.gPrisoner.vid,
        sex: game.gPrisoner.sex
      };

      game.emit(player.getSocket(), result);
      game.gameState = result;

      game.gTimer = startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT_GAME);

    }

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
};






