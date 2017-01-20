/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем список - кто ставил лайки, а кто - дизлайки
 *
 */

const Config    = require('./../../../config.json');
const sanitize  = require('./../../sanitize');
const PF        = require('./../../const_fields');
const emitRes   = require('./../../emit_result');

module.exports = function () {
  let  self = this;
  
  return function(socket, options) {
    
    if(!PF.TRACKID in options) {
      return emitRes(Config.errors.NO_PARAMS, socket, Config.io.emits.IO_GET_LIKES_AND_DISLAKES);
    }

    options[PF.TRACKID] = sanitize(options[PF.TRACKID]);
    
    let  resObj = {
      [PF.LIKES]    : self.getLikes(options[PF.TRACKID]),
      [PF.DISLIKES] : self.getDislikes(options[PF.TRACKID])
    };
    
    emitRes(null, socket, Config.io.emits.IO_GET_LIKES_AND_DISLAKES, resObj);
  }
};