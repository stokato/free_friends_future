/**
 * Игра - кто лучший, получаем и рассылаем всем выбор игроков, сообщаем - кто выбран лучшим
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */

var constants   = require('../../../constants'),
    PF          = constants.PFIELDS,
    addPoints   = require('./../common/add_points'),
    addAction   = require('./../common/add_action'),
    oPool       = require('./../../../objects_pool'),
    handleError = require('./../common/handle_error'),
    stat        = require('./../../../stat_manager');


module.exports = function(game) {
  return function(timer, socket, options) {
  
    // Если обработчек вызван не таймером
    if(!timer) {
      // Ошибка - если выбранного пользоателя нет среди кандидатов
      if(!game._storedOptions[options[PF.PICK]]) {
        return handleError(socket, constants.IO_GAME, constants.G_BEST, constants.errors.NO_THAT_PLAYER);
      }
      
      // Сохраняем ход игрока
      var uid = oPool.userList[socket.id].getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      addAction(game, uid, options);
  
      // Статистика
      for(var item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        var profInfo  = game._activePlayers[item];
        if(options[PF.PICK] == profInfo.id) {
          stat.setUserStat(profInfo.id, profInfo.vid, constants.SFIELDS.BEST_SELECTED, 1);
        }
      }
        
      // Оповещаем о ходе всех в комнате
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
    // После исчерпания всех ходов или истечения таймаута
    if(game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      // Если игроков недостаточно - останавливаем игру
      if(!game.checkCountPlayers()) {
        return game.stop();
      }
      
      // Если кто-то голосовал - показываем результаты, либо сразу переходим к волчку
      if(game._actionsCount == 0) {
  
        for(var bestID in game._storedOptions) if (game._storedOptions.hasOwnProperty(bestID)) {
          
          // Если одини из игроков выбран лучшим всеми, начисляем ему очки
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
  
            // Если хотя бы один не проголосовал - отбой
            if(otherPicks[otherPicksOptions][PF.PICK] != bestID) {
              return false;
            }
          }
        }
    
      return true;
    }
  }
};