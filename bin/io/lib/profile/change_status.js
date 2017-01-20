/**
 * Меняем статус пользователя
 *
 * @param socket, options - объект со статусом, callback
 * @return {Object} - с новым статусом
 */
const Config  = require('./../../../../config.json');
const PF      = require('./../../../const_fields');
const oPool   = require('./../../../objects_pool');

const emitRes  = require('./../../../emit_result');
const sanitize = require('./../../../sanitize');

module.exports = function (socket, options) {
  
  options[PF.STATUS] = sanitize(options[PF.STATUS]);
  
  let selfProfile = oPool.userList[socket.id];
  
  selfProfile.setStatus(options[PF.STATUS], (err, status) => {
    if (err) {
      return emitRes(err, socket, Config.io.emits.IO_CHANGE_STATUS);
    }
    
    emitRes(null, socket, Config.io.emits.IO_CHANGE_STATUS, { [PF.STATUS] : status });
  });
  
};