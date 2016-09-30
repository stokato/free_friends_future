var constants = require('./../../../constants');

var oPool = require('./../../../objects_pool');

// Добавляем лайк к треку
module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];
  var selfProfile = oPool.userList[socket.id];
  var id = selfProfile.getID();
  
  var trackID = options.track_id;
  
  var isTrack = false;
  for(var i = 0; i < room.track_list.length; i++) {
    
    if(room.track_list[i].track_id == trackID) {
      if(!room.likers[trackID][id]) {
        room.track_list[i].likes++;
        room.likers[trackID][id] = true;
      }
      
      if(room.dislikers[trackID][id]) {
        room.dislikers[trackID][id] = false;
        room.track_list[i].dislikes--;
        if(room.track_list[i].dislikes < 0) {
          room.track_list[i].dislikes = 0;
        }
      }
      
      isTrack = true;
    }
  }
  
  if(!isTrack) {
    return callback(constants.errors.NO_SUCH_TRACK);
  }
  
  socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list });
  socket.emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list});
  
  callback(null, null);
};