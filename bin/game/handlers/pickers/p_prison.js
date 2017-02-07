/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 *
 * @param game - Игра
 *
 * Обработчик события выбора игрока в рануде Темница
 * Запоминаем выбор игрока
 * После того как все игроки походят или сработает таймер - переходим к завершению раунда
 */

const oPool  = require('./../../../objects_pool');

module.exports = function (game) {
  return function (socket, options) {
  
    let selfProfile = oPool.userList[socket.id];
    let uid = selfProfile.getID();
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.clearTimer();
      game.getHandler(game.CONST.G_PRISON, game.CONST.GT_FIN)(game);
    }
  }
};