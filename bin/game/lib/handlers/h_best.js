var GameError = require('./../../../game_error');
var constants = require('../../constants');


var constants_io = require('../../../io/constants');

module.exports = function(game) {
  return function(timer, uid, options) { // Лучший, сообщаем всем их выбор
    var f = constants_io.FIELDS, playerInfo;
    if(uid) {
      playerInfo = game.gActivePlayers[uid];

      var result = {};

      //result[f.game] = constants.G_BEST;
      result[f.pick] = {};
      result[f.pick][f.id] = uid;
      result[f.pick][f.vid] = playerInfo.vid;
      result[f.pick][f.pick] = options[f.pick];

      game.emit(playerInfo.player.getSocket(), result);

      // Сохраняем состояние игры
      if(!game.gameState[f.picks]) {
        game.gameState[f.picks] = [];
      }
      game.gameState[f.picks].push(result[f.pick]);

    }

    if(game.gActionsCount == 0 || timer) { // После голосования
      if(!timer) { clearTimeout(game.gTimer); }

      if(game.gActionsCount == 0) {
        game.restoreGame(null, true);
      } else {
        game.restoreGame(null, false);
      }

    }
  }
};