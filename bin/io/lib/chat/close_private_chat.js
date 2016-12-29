/**
 * Закрываем приватный чат
 *
 * @param socket, options - объект с ид чата, callback
 * @return res - объект с ид чата
 */

const constants     = require('./../../../constants');
const oPool         = require('./../../../objects_pool');

const emitRes = require('./../../../emit_result');
const checkID = require('./../../../check_id');
const sanitize = require('./../../../sanitizer');

module.exports = function (socket, options) {
  if(!checkID(options[constants.PFIELDS.ID])) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_CLOSE_PRIVATE_CHAT);
  }
  
  options[constants.PFIELDS.ID] = sanitize(options[constants.PFIELDS.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if(!selfProfile.isPrivateChat(options[constants.PFIELDS.ID])) {
    return emitRes(constants.errors.NO_SUCH_CHAT, socket, constants.IO_CLOSE_PRIVATE_CHAT);
  }
  
  selfProfile.deletePrivateChat(options[constants.PFIELDS.ID]);
  
  let res = {
    [constants.PFIELDS.ID] : options[constants.PFIELDS.ID]
  };
  
  emitRes(null, socket, constants.IO_CLOSE_PRIVATE_CHAT, res);
};
