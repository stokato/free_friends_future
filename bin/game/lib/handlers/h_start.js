/**
 * Начальный этап с волчком, все игроки должны сделать вызов, после чего
 * выбираем произвольно одного из них и переходим к розыгышу волчка
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */

var constants   = require('../../../constants'),
    PF          = constants.PFIELDS,
    addAction   = require('./../common/add_action'),
    oPool       = require('./../../../objects_pool');


module.exports = function(game) {
  return function(timer, socket, options) {
  
    // Если вызов не произведен таймером, сохраняем дейсвие
    if(!timer && socket) {
      var selfProfile = oPool.userList[socket.id];
      var uid = selfProfile.getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      addAction(game, uid, options);
    }
    
    //----------------------------------------------------------------
    // После всех действий или по истечении таймаута
    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      // Если игроков недостаточно - останавливаем игру
      if(!game.checkCountPlayers()) {
        return game.stop();
      }
    
      // Если игрока в темнице нет в комнате - очищаем темницу
      // Получаем следующего игрока
      var nextPlayerInfo;
      if(game._nextGame != constants.G_PRISON) {
        if(game._prisoner) {
          if(!game._room.isProfile(game._prisoner.id)) {
            game._prisoner = null;
          }
        }
        nextPlayerInfo = game.getNextPlayer(true);
      } else {
        nextPlayerInfo = game.getNextPlayer(false);
      }

      // Очищаем настройки
      game._activePlayers = {};
      game._actionsQueue = {};

      // Игрок 1 и ходит 1 раз
      game._activePlayers[nextPlayerInfo.id] = nextPlayerInfo;

      game.setActionLimit(1);
      game._actionsCount = 1;

      // Следующий этап - волчек
      game._nextGame = constants.G_LOT;

      // Отправляем результат
      var result = {};
      result[PF.NEXTGAME] = game._nextGame;
      result[PF.PLAYERS]  = game.getPlayersID();
      result[PF.PRISON]   = null;
      
      if(game._prisoner !== null) {
        result[PF.PRISON] = {};
        result[PF.PRISON][PF.ID] = game._prisoner.id;
        result[PF.PRISON][PF.VID] = game._prisoner.vid;
        result[PF.PRISON][PF.SEX] = game._prisoner.sex;
      }

      game.emit(result);
      game._gameState = result;

      // Устанавливаем таймаут
      game.startTimer(game._handlers[game._nextGame], constants.TIMEOUT_LOT);
    }
  }
};