/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 *
 * Добавляем ворос пользователя в базу
 *
 */

const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');
const oPool     = require('./../../../objects_pool');

const emitRes   = require('./../../../emit_result');
const sanitize  = require('./../../../sanitize');

module.exports = function (socket, options) {
  
  const IO_ADD_QUESTION = Config.io.emits.IO_ADD_QUESTION;
  
  if(!PF.TEXT in options) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_ADD_QUESTION);
  }
  
  options[PF.TEXT] = sanitize(options[PF.TEXT]);
  
  oPool.userList[socket.id].addQuestion(
    options[PF.TEXT],
    options[PF.IMAGE_1],
    options[PF.IMAGE_2],
    options[PF.IMAGE_3], (err) => {
    if (err) {
      return emitRes(err, socket, IO_ADD_QUESTION);
    }
    
    emitRes(null, socket, IO_ADD_QUESTION);
  });
  
};