var constants = require('../../../constants');
var PF        = constants.PFIELDS;
var addPoints = require('./../common/add_points');
var addAction = require('./../common/add_action');
var oPool = require('./../../../objects_pool');
var handleError     = require('./../common/handle_error');

// Игра - кто лучший, рассылаем всем выбор игроков, сообщаем - кто выбран лучшим
module.exports = function(game) {
  return function(timer, socket, options) {
  
    if(!timer) {
  
      // Если нет такого пользоателя среди кандидатов
      if(!game._storedOptions[options[PF.PICK]]) {
        return handleError(socket, constants.IO_GAME, constants.G_BEST, constants.errors.NO_THAT_PLAYER);
      }
      
      var uid = oPool.userList[socket.id].getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      addAction(game, uid, options);
        
      var playerInfo = game._activePlayers[uid];
  
      var result = {};
      result[PF.PICK] = {};
      result[PF.PICK][PF.ID] = uid;
      result[PF.PICK][PF.VID] = playerInfo.vid;
      result[PF.PICK][PF.PICK] = options[PF.PICK];
  
      game.emit(result);
  
      // Сохраняем состояние игры
      if(!game._gameState[PF.PICKS]) {
        game._gameState[PF.PICKS] = [];
      }
      game._gameState[PF.PICKS].push(result[PF.PICK]);
    }

    //------------------------------------------------------------------------------------
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
              if(err) {
                var socket = game._room.getAnySocket();
                return handleError(socket, constants.IO_GAME, constants.G_BEST, err.message);
              }
            })
          }
        }
        
        game.restoreGame(null, true);
      } else {
        game.restoreGame(null, false);
      }
    }

    //---------------
    // Проверяем - врдуг все проголосовали за этого игрока
    function checkBestOfBest(bestID) {
      
        for(var otherID in game._actionsQueue) if(game._actionsQueue.hasOwnProperty(otherID)) {
          var otherPicks = game._actionsQueue[otherID];
        
          for(var otherPicksOptions = 0; otherPicksOptions < otherPicks.length; otherPicksOptions++) {
  
            // Если хотя бы один не проголосовал - возвращаем ложь
            if(otherPicks[otherPicksOptions][PF.PICK] != bestID) {
              return false;
            }
          }
        }
    
      return true;
    }
  }
};