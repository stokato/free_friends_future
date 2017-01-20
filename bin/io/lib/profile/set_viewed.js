/**
 * Created by s.t.o.k.a.t.o on 21.11.2016.
 *
 * Помечаем друзей/гостей/подарки как просмотренными (убираем признак is_new)
 *
 * @param socket, options - объект с флагом, указывающим что помечать, callback
 */

const Config    = require('./../../../../config.json');
const PF        = require('./../../../const_fields');
const oPool     = require('./../../../objects_pool');

const emitRes   = require('./../../../emit_result');
const sanitize  = require('./../../../sanitize');

module.exports = function (socket, options) {
  
  const IO_SET_VIEWED = Config.io.emits.IO_SET_VIEWED;
  
  if(!PF.TARGET in options) {
    return emitRes(Config.errors.NO_PARAMS, socket, IO_SET_VIEWED);
  }
  
  options[PF.TARGET] = sanitize(options[PF.TARGET]);
  
  oPool.userList[socket.id].view(options[PF.TARGET], (err) => {
    if (err) {
      return emitRes(err, socket, IO_SET_VIEWED);
    }
    
    emitRes(null, socket, IO_SET_VIEWED);
  });
  
};