var GameError = require('./../../../game_error');
var constants = require('../../constants');

//var randomPlayer = require('../random_player');
//,
//    startTimer         = require('../start_timer'),
//    activateAllPlayers = require('../activate_all_players'),
//    setActionsLimit    = require('../set_action_limits'),
//  getPlayersID = require('../get_players_id');

var constants_io = require('../../../io/constants');

// Показываем желающим выбор указанного ими игрока
module.exports = function(game) {
  return function(timer, uid, options) { options = options || {};
    var f = constants_io.FIELDS;

    // Есил обработчик вызван игроком а не таймером
    if(uid) {

      // Получаем данные интересуемого игрока
      var sympathy = game.gStoredOptions[options[f.pick]];
      var result, i;

      result = {};
      result[f.picks] = [];
      var pick;
      // Получаем все его ходы и отправляем
      if(sympathy) {
        //result[f.game] = constants.G_SYMPATHY_SHOW;
        for(i = 0; i < sympathy.length; i ++) {
          var pickedId = sympathy[i][f.pick];

          pick = {};
          pick[f.id] = options[f.pick];
          pick[f.vid] = game.gActivePlayers[options[f.pick]].vid;
          pick[f.pick] = {id: pickedId, vid: game.gActivePlayers[pickedId].vid};
          result[f.picks].push(pick);
        }
      } else {
        pick = {};
        pick[f.id] = options[f.pick];

        if(options[f.pick]) {
          pick[f.vid] = game.gActivePlayers[options[f.pick]].vid;
        }
        pick[f.pick] = null;
        result[f.picks].push(pick);
      }

      game.emit(game.gActivePlayers[uid].player.getSocket(), result, uid);
    }

    // После истечения времени на просмотр чужих симпатий переходим к следующему раунду
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      game.restoreGame(null, true);

    }
  }
};