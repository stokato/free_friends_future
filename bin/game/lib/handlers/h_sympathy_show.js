var constants = require('../../../constants');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) { options = options || {};
    // Если обработчик вызван игроком а не таймером
    if(uid) {
      var result = {
        picks : []
      };

      // Получаем все его ходы игрока, о котором хочет узнать текущий и отправляем
      var pickedId, playerInfo, sympathy = game.gStoredOptions[options.pick];
      if(sympathy) {

        for(var i = 0; i < sympathy.length; i ++) {
          pickedId = sympathy[i].pick;

          playerInfo = game.gActivePlayers[options.pick];

          result.picks.push({
            id    : playerInfo.id,
            vid   : playerInfo.vid,
            pick  : {
              id    : pickedId,
              vid   : game.gActivePlayers[pickedId].vid
            }
          });
        }
      } else {
        result.picks.push({
          id    : options.pick,
          vid   : (options.pick)? game.gActivePlayers[options.pick].vid : null,
          pick  : null
        });
      }

      var socket = game.gActivePlayers[uid].player.getSocket();
      game.emit(result, socket);
    }

    // После истечения времени на просмотр чужих симпатий переходим к следующему раунду
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      game.restoreGame(null, true);
    }
  }
};