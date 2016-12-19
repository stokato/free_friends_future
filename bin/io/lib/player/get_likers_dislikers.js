/**
 * Created by s.t.o.k.a.t.o on 19.12.2016.
 *
 * Получаем список - кто ставил лайки, а кто - дизлайки
 *
 */

var oPool = require('./../../../objects_pool');
var PF = require('./../../../constants').PFIELDS;

module.exports = function(socket, options, callback) {
  
  var room = oPool.roomList[socket.id];
  var mPlayer = room.getMusicPlayer();
  
  var res = {};
  res[PF.LIKES] = mPlayer.getLikes(options[PF.TRACKID]);
  res[PF.DISLIKES] = mPlayer.getDislikes(options[PF.TRACKID]);
  
  callback(null, res);
};