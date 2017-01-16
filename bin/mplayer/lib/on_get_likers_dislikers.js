/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем список - кто ставил лайки, а кто - дизлайки
 *
 */

const constants = require('./../../constants');
const sanitize  = require('./../../sanitize');
const emitRes   = require('./../../emit_result');
const PF        = constants.PFIELDS;

module.exports = function () {
  let  self = this;
  
  return function(socket, options) {
    
    if(!PF.TRACKID in options) {
      return emitRes(constants.errors.NO_PARAMS, socket, constants.IO_GET_LIKES_AND_DISLAKES);
    }

    options[PF.TRACKID] = sanitize(options[PF.TRACKID]);
    
    let  res = {
      [PF.LIKES]    : self.getLikes(options[PF.TRACKID]),
      [PF.DISLIKES] : self.getDislikes(options[PF.TRACKID])
    };
    
    emitRes(null, socket, constants.IO_GET_LIKES_AND_DISLAKES, res);
  }
};