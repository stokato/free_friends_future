/**
 * Закрываем приватный чат
 *
 * @param socket, options - объект с ид чата, callback
 * @return res - объект с ид чата
 */

const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');
const oPool     = require('./../../../objects_pool');

const emitRes   = require('./../../../emit_result');
const checkID   = require('./../../../check_id');
const sanitize  = require('./../../../sanitize');

module.exports = function (socket, options) {
  
  const IO_CLOSE_PRIVATE_CHAT = Config.io.emits.IO_CLOSE_PRIVATE_CHAT;
  
  if(!checkID(options[PF.ID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_CLOSE_PRIVATE_CHAT);
  }
  
  options[PF.ID] = sanitize(options[PF.ID]);
  
  let selfProfile = oPool.userList[socket.id];
  
  if(!selfProfile.isPrivateChat(options[PF.ID])) {
    return emitRes(Config.errors.NO_SUCH_CHAT, socket, IO_CLOSE_PRIVATE_CHAT);
  }
  
  selfProfile.deletePrivateChat(options[PF.ID]);
  
  let resObj = {
    [PF.ID] : options[PF.ID]
  };
  
  emitRes(null, socket, IO_CLOSE_PRIVATE_CHAT, resObj);
};
