/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 *
 * Помечаем друзей/гостей/подарки как просмотренными (убираем признак is_new)
 *
 * @param socket, options - объект с флагом, указывающим что помечать, callback
 */

const constants =  require('./../../../constants');
const oPool     = require('./../../../objects_pool');

const emitRes   = require('./../../../emit_result');
const sanitize  = require('./../../../sanitizer');

module.exports = function (socket, options) {
  if(!constants.PFIELDS.TARGET in options) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_SET_VIEWED);
  }
  
  options[constants.PFIELDS.TARGET] = sanitize(options[constants.PFIELDS.TARGET]);
  
  oPool.userList[socket.id].view(options[constants.PFIELDS.TARGET], function (err) {
    if (err) {  return emitRes(err, socket, constants.IO_SET_VIEWED); }
    
    emitRes(null, socket, constants.IO_SET_VIEWED);
  });
  
};