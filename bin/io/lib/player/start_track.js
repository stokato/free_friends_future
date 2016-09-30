var constants = require('./../../../constants');

module.exports = function (room, socket) {
  if(room.track_list.length > 0) {
    var passedTime = Math.round((new Date() - room.trackTime) * 0.001);
    var trackInfo = { track : room.track_list[0], passed_time : passedTime };
    socket.emit(constants.IO_START_TRACK, trackInfo);
  }
};