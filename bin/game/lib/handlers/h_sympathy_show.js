var GameError = require('./../../../game_error');
var constants = require('../../constants');

var constants_io = require('../../../io/constants');
var checkCountPlayers = require('./../check_count_players');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) { options = options || {};
    //var f = constants_io.FIELDS;

    // Есил обработчик вызван игроком а не таймером
    if(uid) {

      // Получаем данные интересуемого игрока
      var result, i;

      result = {};
      result.picks = [];
      var pick;
      // Получаем все его ходы и отправляем
      var sympathy = game.gStoredOptions[options["pick"]];
      if(sympathy) {
        //result[f.game] = constants.G_SYMPATHY_SHOW;
        for(i = 0; i < sympathy.length; i ++) {
          var pickedId = sympathy[i]["pick"];

          pick = {};
          pick.id = options.pick;
          pick.vid = game.gActivePlayers[options.pick].vid;
          pick.pick = {id: pickedId, vid: game.gActivePlayers[pickedId].vid};
          result.picks.push(pick);
        }
      } else {
        pick = {};
        pick.id = options.pick;

        if(options.pick) {
          pick.vid = game.gActivePlayers[options.pick].vid;
        }
        pick.pick = null;
        result.picks.push(pick);
      }

      var socket = game.gActivePlayers[uid].player.getSocket();
      game.emit(socket, result, uid);
    }

    // После истечения времени на просмотр чужих симпатий переходим к следующему раунду
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!checkCountPlayers(game)) {
        return game.stop();
      }

      game.restoreGame(null, true);
    }
  }
};