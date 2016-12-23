/**
 * Запускаем трек
 *
 * @param room, socket
 * @return {Object} - с треком временем и количеством секунд со старта
 */
var constants = require('./../../../constants'),
    PF        = constants.PFIELDS;

module.exports = function (socket, room) {
  var mPlayer   = room.getMusicPlayer();
  var trackList = mPlayer.getTrackList();
  
  if(trackList.length > 0) {
  
    res = {};
    res[PF.TRACKLIST] = trackList;
  
    socket.emit(constants.IO_GET_TRACK_LIST, res);
    
    var passedTime = Math.round((new Date() - mPlayer.getTrackTime()) * 0.001);
    var info = {};
    info[PF.TRACK]        = trackList[0];
    info[PF.PASSED_TIME]  = passedTime;
    
    socket.emit(constants.IO_START_TRACK, info);
  }
};