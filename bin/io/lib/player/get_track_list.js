/**
 * Получаем трек-лист
 *
 * @param socket, options, callback
 * @return trackList - очередь треков для этой комнаты
 */

var oPool = require('./../../../objects_pool');

module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];

  callback(null, room.getMusicPlayer().getTrackList());

};