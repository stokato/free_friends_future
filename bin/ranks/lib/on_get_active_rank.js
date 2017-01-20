/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Получаем активное звание пользователя
 */

const Config  = require('./../../../config.json');
const oPool   = require('./../../objects_pool');
const PF      = require('./../../const_fields');
const emitRes = require('./../../emit_result');

module.exports = function () {
  let self = this;
  
  return function (socket, options) {
  
    let activeRank = oPool.userList[socket.id].onGetActiveRank();
  
    emitRes(null, socket, Config.io.emits.IO_GET_ACTIVE_RANK, { [PF.RANK] : activeRank || null });
  }
};
