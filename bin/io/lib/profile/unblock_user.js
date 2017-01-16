/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Удаляем пользователя из черного списка
 */


const constants  = require('./../../../constants');
const oPool      = require('./../../../objects_pool');

const checkID    = require('./../../../check_id');
const emitRes    = require('./../../../emit_result');
const sanitize   = require('./../../../sanitize');

const PF         = constants.PFIELDS;

module.exports = function (socket, options) {
  if(!checkID(options[PF.ID])) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_UNBLOCK_USER);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    return emitRes(constants.errors.SELF_ILLEGAL, socket, constants.IO_UNBLOCK_USER);
  }
  
  selfProfile.delFromBlackList(options[PF.ID], function (err) {
    if (err) { return emitRes(err, socket, constants.IO_UNBLOCK_USER); }
  
    emitRes(null, socket, constants.IO_UNBLOCK_USER);
  });
  
};


