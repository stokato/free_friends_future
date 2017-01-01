/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Проверяем - можно ли добавить бесплатный трек
 */

const oPool     = require('./../../objects_pool');
const constants = require('./../../constants');
const emitRes   = require('./../../emit_result');
const PF        = constants.PFIELDS;

module.exports = function () {
  let  self = this;
  
  return function(socket, options) {
    
    let  selfProfile = oPool.userList[socket.id];
    let  isActive = true;
    
    for (let  i = 0; i < self._mTrackList.length; i++) {
      if (self._mTrackList[i][PF.ID] == selfProfile.getID()) {
        isActive = false;
        break;
      }
    }
    
    emitRes(null, socket, constants.IO_GET_FREE_TRACK_STATE, { [PF.IS_ACTIVE] : isActive });
  }
};