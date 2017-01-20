/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Проверяем - можно ли добавить бесплатный трек
 */

const Config    = require('./../../../config.json');
const oPool     = require('./../../objects_pool');
const PF        = require('./../../const_fields');
const emitRes   = require('./../../emit_result');

module.exports = function () {
  let  self = this;
  
  return function(socket, options) {
    
    let  selfProfile = oPool.userList[socket.id];
    let  isActive = true;
    let  tlLen = self._mTrackList.length;
      
    for (let  i = 0; i < tlLen; i++) {
      if (self._mTrackList[i][PF.ID] == selfProfile.getID()) {
        isActive = false;
        break;
      }
    }
    
    emitRes(null, socket, Config.io.emits.IO_GET_FREE_TRACK_STATE, { [PF.IS_ACTIVE] : isActive });
  }
};