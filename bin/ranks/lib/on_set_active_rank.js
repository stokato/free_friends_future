/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Устанавливаем активность звания
 */

const constants = require('./../../constants');
const oPool     = require('./../../objects_pool');
const sanitize  = require('./../../sanitizer');
const emitRes   = require('./emit_result');

const PF   = constants.PFIELDS;
const EMIT = constants.IO_CHANGE_ACTIVE_RANK;

module.exports = function () {
  let self = this;
  
  return function (socket, options) {
  
    if(!PF.RANK in options) {
      return emitRes(constants.errors.NO_PARAMS, socket, EMIT);
    }
  
    options[PF.RANK] = sanitize(options[PF.RANK]);
  
    let selfProfile = oPool.userList[socket.id];
    let rankOwnerID = self.getRankOwner(options[constants.PFIELDS.RANK]);
  
    if(rankOwnerID != selfProfile.getID()) {
      return emitRes(constants.errors.NO_SUCH_RUNK, socket, EMIT);
    }
  
    selfProfile.onSetActiveRank(options[constants.PFIELDS.RANK]);
  
    emitRes(null, socket, EMIT);
  }
  
};