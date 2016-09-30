// Игра - кто лучший, рассылаем всем выбор игроков, сообщаем - кто выбран лучшим
module.exports = function(game) {
  return function(timer, uid, options) {
    if(uid) { broadcastPick(game, uid);  }

    // После голосования
    if(game.gActionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game.gTimer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      // Если кто-то голосовал - показываем результаты, либо сразу переходим к волчку
      if(game.gActionsCount == 0) {
        game.restoreGame(null, true);
      } else {
        game.restoreGame(null, false);
      }
    }

    //---------------
    function broadcastPick(game, uid) {
      var playerInfo = game.gActivePlayers[uid];

      var result = {
        pick : {
          id    : uid,
          vid   : playerInfo.vid,
          pick  : options.pick
        }
      };
      game.emit(result);

      // Сохраняем состояние игры
      if(!game.gameState.picks) {
        game.gameState.picks = [];
      }
      game.gameState.picks.push(result.pick);
    }
  }
};