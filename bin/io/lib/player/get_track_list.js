/**
 * Получаем трек-лист
 *
 * @param socket, options, callback
 * @return trackList - очередь треков для этой комнаты
 */

var oPool = require('./../../../objects_pool');
var PF = require('./../../../constants').PFIELDS;

module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];
  
  var res = {};
  res[PF.TRACKLIST] = room.getMusicPlayer().getTrackList();

  callback(null, res);
  
};