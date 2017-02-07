/**
 * Created by s.t.o.k.a.t.o on 13.01.2017.
 *
 * @param game - Игра
 *
 * Обработичк события выбора игрока в игре бутылочка - этап первый - выбор пары для поцелуя
 * Запоминаем выбор игрока
 * После того как все игроки походят или сработает таймер - переходим к завершению раунда
 *
 */

const oPool = require('./../../../objects_pool');

module.exports = function (game) {
  return function (socket, options) {
    let uid = oPool.userList[socket.id].getID();
  
    game.addAction(uid, options);
  
    if(game.getActionsCount() == 0) {
      game.clearTimer();
      game.getHandler(game.CONST.G_BOTTLE, game.CONST.GT_FIN)(game);
    }
  }
};