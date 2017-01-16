/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 *
 * Добавляем ворос пользователя в базу
 *
 */

const constants = require('./../../../constants');
const oPool     = require('./../../../objects_pool');

const emitRes = require('./../../../emit_result');
const sanitize = require('./../../../sanitize');

const PF        = constants.PFIELDS;

module.exports = function (socket, options) {
  if(!PF.TEXT in options) {
    return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_ADD_QUESTION);
  }
  
  options[PF.TEXT] = sanitize(options[PF.TEXT]);
  
  oPool.userList[socket.id].addQuestion(options[PF.TEXT],
      options[PF.IMAGE_1], options[PF.IMAGE_2], options[PF.IMAGE_3],  function (err) {
    if (err) {  return emitRes(err, socket, constants.IO_ADD_QUESTION); }
    
    emitRes(null, socket, constants.IO_ADD_QUESTION);
  });
  
};