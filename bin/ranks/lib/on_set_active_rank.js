/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Устанавливаем активность звания
 */

const Config    = require('./../../../config.json');
const PF        = require('./../../const_fields');
const oPool     = require('./../../objects_pool');
const sanitize  = require('./../../sanitize');
const emitRes   = require('./../../emit_result');

module.exports = function () {
  
  const EMIT = Config.io.emits.IO_CHANGE_ACTIVE_RANK;
  
  let self = this;
  
  return function (socket, options) {
  
    if(!PF.RANK in options) {
      return emitRes(Config.errors.NO_PARAMS, socket, EMIT);
    }
  
    options[PF.RANK] = sanitize(options[PF.RANK]);
  
    let selfProfile = oPool.userList[socket.id];
    let rankOwnerID = self.getRankOwner(options[PF.RANK]);
  
    if(rankOwnerID != selfProfile.getID()) {
      return emitRes(Config.errors.NO_SUCH_RUNK, socket, EMIT);
    }
  
    selfProfile.onSetActiveRank(options[PF.RANK]);
  
    emitRes(null, socket, EMIT);
  }
  
};