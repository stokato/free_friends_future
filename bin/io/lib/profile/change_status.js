/**
 * Меняем статус пользователя
 *
 * @param socket, options - объект со статусом, callback
 * @return {Object} - с новым статусом
 */
const Config = require('./../../../../config.json');
const oPool     = require('./../../../objects_pool');

const emitRes = require('./../../../emit_result');
const sanitize = require('./../../../sanitize');
const PF = require('./../../../const_fields');

module.exports = function (socket, options) {
  
  options[PF.STATUS] = sanitize(options[PF.STATUS]);
  
  let selfProfile = oPool.userList[socket.id];
  selfProfile.setStatus(options[PF.STATUS], function (err, status) {
    if (err) { return emitRes(err, socket, Config.io.emits.IO_CHANGE_STATUS); }
    
    let res = { [PF.STATUS] : status };
    
    emitRes(null, socket, Config.io.emits.IO_CHANGE_STATUS, res);
  });
  
};