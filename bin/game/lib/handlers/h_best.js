var constants = require('../../../constants');
var addPoints = require('./../common/add_points');

var GameError = require('./../common/game_error');

// Игра - кто лучший, рассылаем всем выбор игроков, сообщаем - кто выбран лучшим
module.exports = function(game) {
  return function(timer, uid, options) {
    if(uid) { broadcastPick(game, uid);  }

    // После голосования
    if(game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      if(!game.checkCountPlayers()) {
        return game.stop();
      }
      
      // Если кто-то голосовал - показываем результаты, либо сразу переходим к волчку
      if(game._actionsCount == 0) {
  
        for(var bestID in game._storedOptions) if (game._storedOptions.hasOwnProperty(bestID)) {
          
          if(checkBestOfBest(bestID) == true) {
            addPoints(bestID, constants.BEST_POINTS, function (err) {
              if(err) { return new GameError(constants.G_BOTTLE_KISSES, err.message); }
            })
          }
        }
        
        game.restoreGame(null, true);
      } else {
        game.restoreGame(null, false);
      }
    }

    //---------------
    // Обрабатываем ход каждого игрока
    function broadcastPick(game, uid) {
      var playerInfo = game._activePlayers[uid];

      var result = {
        pick : {
          id    : uid,
          vid   : playerInfo.vid,
          pick  : options.pick
        }
      };
      game.emit(result);

      // Сохраняем состояние игры
      if(!game._gameState.picks) {
        game._gameState.picks = [];
      }
      game._gameState.picks.push(result.pick);
    }
  
    // Проверяем - врдуг все проголосовали за этого игрока
    function checkBestOfBest(bestID) {
      
        for(var otherID in game._actionsQueue) if(game._actionsQueue.hasOwnProperty(otherID)) {
          var otherPicks = game._actionsQueue[otherID];
        
          for(var otherPicksOptions = 0; otherPicksOptions < otherPicks.length; otherPicksOptions++) {
  
            // Если хотя бы один не проголосовал - возвращаем ложь
            if(otherPicks[otherPicksOptions].pick != bestID) {
              return false;
            }
          }
        }
    
      return true;
    }
  }
};