var GameError = require('./../../../game_error');
var constants = require('../../constants');
var checkCountPlayers = require('./../check_count_players');

module.exports = function(game) {
  return function(timer, uid, options) { // Лучший, сообщаем всем их выбор
    //var f = constants_io.FIELDS, playerInfo;
    if(uid) {
      broadcastPick(game, uid);
    }

    if(game.gActionsCount == 0 || timer) { // После голосования
      if(!timer) { clearTimeout(game.gTimer); }

      if(!checkCountPlayers(game)) {
        return game.stop();
      }

      if(game.gActionsCount == 0) {
        game.restoreGame(null, true);
      } else {
        game.restoreGame(null, false);
      }
    }

    //---------------
    function broadcastPick(game, uid) {
      var playerInfo = game.gActivePlayers[uid];

      var result = {};
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
  }
};