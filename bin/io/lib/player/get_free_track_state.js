/**
 * Created by s.t.o.k.a.t.o on 27.12.2016.
 *
 * Проверяем - можно ли добавить бесплатный трек
 */

var oPool = require('./../../../objects_pool');
var PF = require('./../../../constants').PFIELDS;

module.exports = function(socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  var room = oPool.roomList[socket.id];
  var trackList = room.getMusicPlayer().getTrackList();
  
  var isActive = true;
  
  for (var i = 0; i < trackList.length; i++) {
    if (trackList[i][PF.ID] == selfProfile.getID()) {
      isActive = false;
      break;
    }
  }
  
  var res = {};
  res[PF.IS_ACTIVE] = isActive;
  
  callback(null, res);
  
};