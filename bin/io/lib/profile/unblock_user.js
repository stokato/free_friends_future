/**
 * Created by s.t.o.k.a.t.o on 15.12.2016.
 *
 * Удаляем пользователя из черного списка
 */

const Config     = require('./../../../../config.json');
const PF         = require('./../../../const_fields');
const oPool      = require('./../../../objects_pool');

const checkID    = require('./../../../check_id');
const emitRes    = require('./../../../emit_result');
const sanitize   = require('./../../../sanitize');

module.exports = function (socket, options) {
  
  const IO_UNBLOCK_USER = Config.io.emits.IO_UNBLOCK_USER;
  
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_UNBLOCK_USER);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if (selfProfile.getID() == options[PF.ID]) {
    return emitRes(Config.errors.SELF_ILLEGAL, socket, IO_UNBLOCK_USER);
  }
  
  selfProfile.delFromBlackList(options[PF.ID], (err) => {
    if (err) {
      return emitRes(err, socket, IO_UNBLOCK_USER);
    }
  
    emitRes(null, socket, IO_UNBLOCK_USER);
  });
  
};


