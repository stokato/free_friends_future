var constants = require('../../../constants');
var addPoints = require('./../common/add_points');

var GameError = require('./../../../game_error');

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
  
        for(var bestID in game.gStoredOptions) if (game.gStoredOptions.hasOwnProperty(bestID)) {
          
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
  
    function checkBestOfBest(bestID) {
      
        for(var otherID in game.gActionsQueue) if(game.gActionsQueue.hasOwnProperty(otherID)) {
          var otherPicks = game.gActionsQueue[otherID];
        
          for(var otherPicksOptions = 0; otherPicksOptions < otherPicks.length; otherPicksOptions++) {
            if(otherPicks[otherPicksOptions].pick != bestID) {
              return false;
            }
          }
        }
    
      return true;
    }
  }
};