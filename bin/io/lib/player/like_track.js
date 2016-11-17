var constants = require('./../../../constants');

var oPool = require('./../../../objects_pool');

// Добавляем лайк к треку
module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];
  var selfProfile = oPool.userList[socket.id];

  var trackID = options.track_id;
  
  var isTrack = room.like(selfProfile.getID(), trackID);
  
  if(!isTrack) {
    return callback(constants.errors.NO_SUCH_TRACK);
  }
  
  socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list });
  socket.emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list});
  
  callback(null, null);
};