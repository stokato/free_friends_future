/**
 * Запускаем трек
 *
 * @param room, socket
 * @return {Object} - с треком временем и количеством секунд со старта
 */
const Config = require('./../../../config.json');
const PF     = require('./../../const_fields');

module.exports = function (socket) {
  
  if(this._mTrackList.length > 0) {
  
    socket.emit(Config.io.emits.IO_GET_TRACK_LIST, { [PF.TRACKLIST] : this._mTrackList });
    
    let  passedTime = Math.round((new Date() - this.getTrackTime()) * 0.001);
    
    let  infoObj = {
      [PF.TRACK]        : this._mTrackList[0],
      [PF.PASSED_TIME]  : passedTime
    };
    
    socket.emit(Config.io.emits.IO_START_TRACK, infoObj);
  }
};