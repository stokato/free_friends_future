var constants = require('../../../constants');

// Симпатии, ждем, когда все ответят и переходим к показу результатов
module.exports = function(game) {
  return function (timer) {
    if (game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      game.gNextGame = constants.G_SYMPATHY_SHOW;

      // Сохраняем выбор игроков
      game.gStoredOptions = game.gActionsQueue;

      // Очищаем настройки
      game.gActivePlayers = {};
      game.gActionsQueue = {};

      // Все игроки могут посмотреть результаты всех
      game.activateAllPlayers();
      var countPrisoners = (game.gPrisoner === null)? 0 : 1;

      game.setActionLimit(game.gRoom.girls_count + game.gRoom.guys_count - 1 - countPrisoners);
      game.gActionsCount = (game.gRoom.girls_count + game.gRoom.guys_count - countPrisoners) * 10;

      // Отправляем результаты
      var result = {
        next_game   : game.gNextGame,
        players     : game.getPlayersID(),
        prison      : null
      };
      
      if(game.gPrisoner !== null) {
        result.prison = {
          id : game.gPrisoner.id,
          vid: game.gPrisoner.vid,
          sex: game.gPrisoner.sex
        }
      }

      game.emit(result);

      // Сохраняем состояние игры
      game.gameState = result;

      // Устанавливаем таймер
      game.startTimer(game.gHandlers[game.gNextGame], constants.TIMEOUT_SYMPATHY_SHOW);
    }
  }
};