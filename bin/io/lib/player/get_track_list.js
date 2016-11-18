var oPool = require('./../../../objects_pool');

// Возвращаем плей-лист комнаты
module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];

  callback(null, room.getMusicPlayer().getTrackList());

};