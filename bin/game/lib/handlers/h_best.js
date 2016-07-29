var GameError = require('./../../../game_error');
var constants = require('../../constants');


//var constants_io = require('../../../io/constants');

module.exports = function(game) {
  return function(timer, uid, options) { // Лучший, сообщаем всем их выбор
    //var f = constants_io.FIELDS, playerInfo;
    if(uid) {
      playerInfo = game.gActivePlayers[uid];

      var result = {};

      //result[f.game] = constants.G_BEST;
      result.pick = {};
      result.pick.id = uid;
      result.pick.vid = playerInfo.vid;
      result.pick.pick = options.pick;

      game.emit(playerInfo.player.getSocket(), result);

      // Сохраняем состояние игры
      if(!game.gameState.picks) {
        game.gameState.picks = [];
      }
      game.gameState.picks.push(result.pick);

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