var constants = require('./../../../constants'),
    oPool     = require('./../../../objects_pool');

// Добавляем дизлайк к треку
module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];
  var selfProfile = oPool.userList[socket.id];
  
  var trackID = options.track_id;
  
  var isTrack = room.dislike(selfProfile.getID(), trackID);
  
  if(!isTrack) { return callback(constants.errors.NO_SUCH_TRACK); }
  
  socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list });
  socket.emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list});
  
  callback(null, null);
};