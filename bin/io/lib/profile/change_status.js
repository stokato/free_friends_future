/**
 * Меняем статус пользователя
 *
 * @param socket, options - объект со статусом, callback
 * @return {Object} - с новым статусом
 */
const constants = require('./../../../constants');
const oPool     = require('./../../../objects_pool');

const emitRes = require('./../../../emit_result');
const sanitize = require('./../../../sanitizer');

module.exports = function (socket, options) {
  
  options[constants.PFIELDS.STATUS] = sanitize(options[constants.PFIELDS.STATUS]);
  
  let selfProfile = oPool.userList[socket.id];
  selfProfile.setStatus(options[constants.PFIELDS.STATUS], function (err, status) {
    if (err) { return emitRes(err, socket, constants.IO_CHANGE_STATUS); }
    
    let res = { [constants.PFIELDS.STATUS] : status };
    
    emitRes(null, socket, constants.IO_CHANGE_STATUS, res);
  });
  
};