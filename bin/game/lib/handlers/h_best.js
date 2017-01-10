/**
 * Игра - кто лучший, получаем и рассылаем всем выбор игроков, сообщаем - кто выбран лучшим
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */

const Config        = require('./../../../../config.json');

const constants   = require('../../../constants'),
    PF          = constants.PFIELDS,
    addPoints   = require('./../common/add_points'),
    addAction   = require('./../common/add_action'),
    oPool       = require('./../../../objects_pool'),
    handleError = require('./../common/handle_error'),
    stat        = require('./../../../stat_manager');

const BEST_POINTS = Number(Config.points.game.best);

module.exports = function(game) {
  return function(timer, socket, options) {
  
    // Если обработчек вызван не таймером
    if(!timer) {
      // Ошибка - если выбранного пользоателя нет среди кандидатов
      if(!game._storedOptions[options[PF.PICK]]) {
        return handleError(socket, constants.IO_GAME, constants.G_BEST, constants.errors.NO_THAT_PLAYER);
      }
      
      // Сохраняем ход игрока
      let uid = oPool.userList[socket.id].getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      addAction(game, uid, options);
  
      // Статистика
      for(let item in game._storedOptions) if(game._storedOptions.hasOwnProperty(item)) {
        let profInfo  = game._storedOptions[item];
        if(options[PF.PICK] == profInfo.id) {
          if(!profInfo.picks) {
            profInfo.picks = 1;
          } else {
            profInfo.picks++;
          }
        }
      }
        
      // Оповещаем о ходе всех в комнате
      let playerInfo = game._activePlayers[uid];
  
      let result = {};
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
      // if(!game.checkCountPlayers()) {
      //   return game.stop();
      // }
      
      stat.setMainStat(constants.SFIELDS.BEST_ACTIVITY, game.getActivityRating());
      
      // Если кто-то голосовал - показываем результаты, либо сразу переходим к волчку
      if(game._actionsCount != game._actionsMain) {
  
        // Проверяем - кто выбран лучшим, начисляем ему очки
        let bestPlayer = { id: null, picks : 0 };
        
        for(let bestID in game._storedOptions) if (game._storedOptions.hasOwnProperty(bestID)) {
          let profInfo = game._storedOptions[bestID];
          if(profInfo.picks > bestPlayer.picks) {
            bestPlayer.id = bestID;
            bestPlayer.vid = profInfo.vid;
            bestPlayer.picks = profInfo.picks;
          } else if(profInfo.picks == bestPlayer.picks) {
            bestPlayer.id = null;
            bestPlayer.vid = null;
          }
        }
        
        if(bestPlayer.id) {
          stat.setUserStat(bestPlayer.id, bestPlayer.vid, constants.SFIELDS.BEST_SELECTED, 1);
          addPoints(bestPlayer.id, BEST_POINTS, function (err) {
            if(err) {
              let socket = game._room.getAnySocket();
              return handleError(socket, constants.IO_GAME, constants.G_BEST, err.message);
            }
          });
        }
        
        game.restoreGame(null, true);
      } else {
        game.restoreGame(null, false);
      }
    }
  }
};