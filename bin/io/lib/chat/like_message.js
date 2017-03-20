/**
 * Created by s.t.o.k.a.t.o on 22.02.2017.
 */

const Config          = require('./../../../../config.json');
const PF              = require('./../../../const_fields');
const emitRes         = require('./../../../emit_result');
const checkID         = require('./../../../check_id');
const sanitize        = require('./../../../sanitize');
const oPool           = require('./../../../objects_pool');

module.exports = function (socket, options) {
  if((PF.MESSAGEID in options) && !checkID(options[PF.MESSAGEID])) {
    return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_MESSAGE, null, true);
  }
  
  if(PF.MESSAGEID in options) {
    options[PF.MESSAGEID] = sanitize(options[PF.MESSAGEID]);
  }
  
  let room = oPool.roomList[socket.id];
  let selfProfile = oPool.userList[socket.id];
  
  let message = room.likeMessage(options[PF.MESSAGEID], selfProfile.getID());
  
  if(message) {
    let res = {
      [PF.MESSAGEID] : message[PF.MESSAGEID],
      [PF.LIKES] : message[PF.LIKES]
    };
    
    socket.broadcast.in(room.getName()).emit(Config.io.emits.IO_LIKE_MESSAGE, res);
    emitRes(null, socket, Config.io.emits.IO_LIKE_MESSAGE, res);
  } else {
    emitRes(Config.errors.NO_SUCH_MESSAGE, socket, Config.io.emits.IO_LIKE_MESSAGE);
  }
};