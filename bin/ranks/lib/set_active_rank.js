/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Устанавливаем активность звания
 */

const constants = require('./../../constants'),
      oPool     = require('./../../objects_pool'),
      emitRes   = require('./emit_result');

module.exports = function (socket, options) {
  
  let selfProfile = oPool.userList[socket.id];
  
  let rankOwnerID = this.getRankOwner(options[constants.PFIELDS.RANK]);
  
  if(rankOwnerID != selfProfile.getID()) {
    return emitRes(constants.errors.NO_SUCH_RUNK, socket, constants.IO_CHANGE_ACTIVE_RANK);
  }
  
  selfProfile.setActiveRank(options[constants.PFIELDS.RANK]);
  
  emitRes(null, socket, constants.IO_CHANGE_ACTIVE_RANK);
};