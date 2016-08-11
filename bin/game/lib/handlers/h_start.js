var constants     = require('../../../constants');


// Начальный этап с волчком, все игроки должны сделать вызов, после чего
// выбираем произвольно одного из них и переходим к розыгышу волчка
module.exports = function(game) {
  return function(timer) {
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      var nextPlayerInfo;
      // Если игрока в темнице нет в комнате - очищаем темницу
      // Получаем следующего игрока
      if(game.gNextGame != constants.G_PRISON) {
        if(game.gPrisoner) {
          if(!game.isPlayerInRoom(game.gPrisoner.id)) {
            game.gPrisoner = null;
          }
        }
        nextPlayerInfo = game.getNextPlayer(true);
      } else {
        nextPlayerInfo = game.getNextPlayer(false);
      }

      // Очищаем настройки
      game.gActivePlayers = {};
      game.gActionsQueue = {};

      // Игрок ходит 1 раз
      game.gActivePlayers[nextPlayerInfo.id] = nextPlayerInfo;

      game.setActionLimit(1);
      game.gActionsCount = 1;

      game.gNextGame = constants.G_LOT;

      var result = {
        next_game   : game.gNextGame,
        players     : game.getPlayersID()
      };
      result.prison = null;
      if(game.gPrisoner !== null) {
        result.prison = {
          id : game.gPrisoner.id,
          vid: game.gPrisoner.vid,
          sex: game.gPrisoner.sex
        }
      }

      game.emit(result);
      game.gameState = result;

      // Устанавливаем таймаут
      game.startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT_LOT);
    }
  }
};