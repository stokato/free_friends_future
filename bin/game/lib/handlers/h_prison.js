/**
 * Помещаем игрока в темницу
 *
 * @param timer - признак - запущено таймером, socket, options - объект с выбором игрока
 */
const constants = require('../../../constants'),
      addAction = require('./../common/add_action'),
      oPool     = require('./../../../objects_pool');

module.exports = function(game) {
  return function(timer, socket, options) {
  
    // Если вызов произведен игроком, сохраняем его выбор
    if(!timer) {
      let selfProfile = oPool.userList[socket.id];
      let uid = selfProfile.getID();
  
      if(!game._actionsQueue[uid]) {
        game._actionsQueue[uid] = [];
      }
  
      addAction(game, uid, options);
    }
    
    //-----------------------------------------------------------
    // Если все игроки походили или истек таймаут
    if (game._actionsCount == 0 || timer) {
      if(!timer) { clearTimeout(game._timer); }

      // Если игроков не хватает - останавливаем игру
      if(!game.checkCountPlayers()) {
        return game.stop();
      }

      // Помещаем тукущего игрока в темницу
      for(let item in game._activePlayers) if(game._activePlayers.hasOwnProperty(item)) {
        game._prisoner = game._activePlayers[item];
      }

      //
      game._actionsCount = 0;

      // Переходим к волчку
      game._handlers[constants.G_START](false);
    }
  }
};






