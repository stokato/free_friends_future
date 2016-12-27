/**
 * Created by s.t.o.k.a.t.o on 23.12.2016.
 *
 * Устанавливаем активность звания
 */
const oPool    = require('./../../../objects_pool');

module.exports = function (socket, options) {
  
  oPool.roomList[socket.id].getRanks().setActiveRank(socket, options);
  
};