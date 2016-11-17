var constants = require('./../../../constants');

module.exports = function (room, socket) {
  var trackList = room.getTrackList();
  
  if(trackList.length > 0) {
    var passedTime = Math.round((new Date() - room.getTrackTime()) * 0.001);
    var trackInfo = { track : trackList[0], passed_time : passedTime };
    socket.emit(constants.IO_START_TRACK, trackInfo);
  }
};