var constants = require('./../../../constants'),
    PF        = constants.PFIELDS,
    oPool     = require('./../../../objects_pool');

// Добавляем лайк к треку
module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];
  var mPlayer = room.getMusicPlayer();
  
  var selfProfile = oPool.userList[socket.id];

  var trackID = options[PF.TRACKID];
  
  var isTrack = mPlayer.like(selfProfile.getID(), trackID);
  
  if(!isTrack) { return callback(constants.errors.NO_SUCH_TRACK); }
  
  var res = {};
  res[PF.TRACKLIST] = mPlayer.getTrackList();
  
  socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
  socket.emit(constants.IO_GET_TRACK_LIST, res);
  
  callback(null, null);
};