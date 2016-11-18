var constants = require('./../../../constants'),
    oPool     = require('./../../../objects_pool');

// Добавляем дизлайк к треку
module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];
  var mPlayer = room.getMusicPlayer();
  var selfProfile = oPool.userList[socket.id];
  
  var trackID = options.track_id;
  
  var isTrack = mPlayer.dislike(selfProfile.getID(), trackID);
  
  if(!isTrack) { return callback(constants.errors.NO_SUCH_TRACK); }
  
  var trackList = mPlayer.getTrackList();
  
  socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, { track_list : trackList });
  socket.emit(constants.IO_GET_TRACK_LIST, { track_list : trackList });
  
  callback(null, null);
};