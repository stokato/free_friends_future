var constants = require('./../../../constants');

module.exports = function (socket, room) {
  
  if(room.getTrackList().length > 0) {
    
    var passedTime = Math.round((new Date() - room.getTrackTime()) * 0.001);
    var trackInfo = { track : room.track_list[0], passed_time : passedTime };
    
    socket.emit(constants.IO_START_TRACK, trackInfo);
  }
  
};