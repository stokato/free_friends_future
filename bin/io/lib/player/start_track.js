var constants = require('./../../../constants');

module.exports = function (room, socket) {
  var mPlayer = room.getMusicPlayer();
  var trackList = mPlayer.getTrackList();
  
  if(trackList.length > 0) {
    var passedTime = Math.round((new Date() - mPlayer.getTrackTime()) * 0.001);
    var trackInfo = { track : trackList[0], passed_time : passedTime };
    socket.emit(constants.IO_START_TRACK, trackInfo);
  }
};