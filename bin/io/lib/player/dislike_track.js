var constants = require('./../../../constants');

var oPool = require('./../../../objects_pool');

// Добавляем дизлайк к треку
module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];
  var selfProfile = oPool.userList[socket.id];
  var id = selfProfile.getID();
  
  var isTrack = false;
  
  var trackID = options.track_id;
  
  for(var i = 0; i < room.track_list.length; i++) {
    
    if(room.track_list[i].track_id == trackID) {
      if(!room.dislikers[trackID][id]) {
        room.track_list[i].dislikes++;
        room.dislikers[trackID][id] = true;
      }
      
      if(room.likers[trackID][id]) {
        room.likers[trackID][id] = false;
        room.track_list[i].likes--;
        if(room.track_list[i].likes < 0) {
          room.track_list[i].likes = 0;
        }
      }
      isTrack = true;
    }
    
  }
  
  if(!isTrack) { return callback(constants.errors.NO_SUCH_TRACK); }
  
  socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list });
  socket.emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list});
  
  callback(null, null);
};