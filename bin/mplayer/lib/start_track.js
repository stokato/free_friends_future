/**
 * Запускаем трек
 *
 * @param room, socket
 * @return {Object} - с треком временем и количеством секунд со старта
 */
const constants = require('./../../constants');
const PF        = constants.PFIELDS;

module.exports = function (socket) {
  
  if(this._mTrackList.length > 0) {
  
    socket.emit(constants.IO_GET_TRACK_LIST, { [PF.TRACKLIST] : this._mTrackList });
    
    let  passedTime = Math.round((new Date() - this.getTrackTime()) * 0.001);
    
    let  info = {
      [PF.TRACK]        : this._mTrackList[0],
      [PF.PASSED_TIME]  : passedTime
    };
    
    socket.emit(constants.IO_START_TRACK, info);
  }
};