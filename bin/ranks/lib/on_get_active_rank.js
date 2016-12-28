/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Получаем активное звание пользователя
 */

const oPool = require('./../../objects_pool');
const constants = require('./../../constants');
const emitRes = require('./emit_result');

module.exports = function () {
  let self = this;
  
  return function (socket, options) {
  
    let activeRank = oPool.userList[socket.id].onGetActiveRank();
  
    let res = {
      [constants.PFIELDS.RANK] : activeRank || null
    };
  
    emitRes(null, socket, constants.IO_GET_ACTIVE_RANK, res);
  }
};
