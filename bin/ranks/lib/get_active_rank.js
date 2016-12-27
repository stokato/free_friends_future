/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Получаем активное звание пользователя
 */

const oPool = require('./../../objects_pool');
const constants = require('./../../constants');
const emitRes = require('./emit_result');

module.exports = function (socket, options) {
  
  let activeRank = oPool.userList[socket.id].getActiveRank();
  
  let res = {};
  res[constants.PFIELDS.RANK] = activeRank || null;
  
  emitRes(null, socket, constants.IO_GET_ACTIVE_RANK, res);
};
