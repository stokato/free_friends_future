/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Получаем прогресс по званиям игрока
 *
 */

var constants =  require('./../../../constants'),
  oPool     = require('./../../../objects_pool');

module.exports = function (socket, options) {
  
  oPool.roomList[socket.id].getRanks().getRanksOfProfile(socket, options);
  
};