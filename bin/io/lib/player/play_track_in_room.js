var constants = require('./../../../constants'),
    PF        = constants.PFIELDS;

module.exports = function (socket, room) {
  
  var mPlayer   = room.getMusicPlayer();
  var trackList = mPlayer.getTrackList();
  
  if(trackList.length > 0) {
    
    var passedTime = Math.round((new Date() - mPlayer.getTrackTime()) * 0.001);
    var info = {};
    info[PF.TRACK]        = trackList[0];
    info[PF.PASSED_TIME]  = passedTime;
    
    socket.emit(constants.IO_START_TRACK, info);
  }
  
};