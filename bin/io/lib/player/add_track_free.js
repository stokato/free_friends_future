/**
 * Добавляем трек в очередь, отправляем в комнату обновленный трек-лист
 *
 * @param socket, options - объект с ид трека (из вк), callback
 *
 */

var constants  = require('./../../../constants'),
  PF         = constants.PFIELDS,
  oPool      = require('./../../../objects_pool');

var startTrack = require('./start_track_timer');
const emitRes = require('./../../../emit_result');

module.exports = function(socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  var room = oPool.roomList[socket.id];
  
  var mPlayer = room.getMusicPlayer();
  var trackList = mPlayer.getTrackList();
  
  // Проверяем - есть ли такой трек в очереди
  for (var i = 0; i < trackList.length; i++) {
    if (trackList[i][PF.TRACKID] == options[PF.TRACKID]) {
      return callback(constants.errors.ALREADY_IS_TRACK);
    }
  }
  
  // Проверяем - есть ли наш трек в очереди
  for (i = 0; i < trackList.length; i++) {
    if (trackList[i][PF.ID] == selfProfile.getID()) {
      return callback(constants.errors.BLOCK_FREE_TRACK);
    }
  }
  
  var track = {
    track_id    : options.track_id,
    id          : selfProfile.getID(),
    vid         : selfProfile.getVID(),
    likes       : 0,
    dislikes    : 0,
    duration    : options.duration
  };
  
  track[PF.TRACKID]  = options[PF.TRACKID];
  track[PF.ID]       = selfProfile.getID();
  track[PF.VID]      = selfProfile.getVID();
  track[PF.LIKES]    = 0;
  track[PF.DISLIKES] = 0;
  track[PF.DURATION] = options[PF.DURATION];
  
  // Если очередь пустая, запускаем сразу
  if (trackList.length == 0) {
    mPlayer.setTrackTime(new Date());
    startTrack(socket, room, track);
  }
  
  mPlayer.addTrack(track);
  
  var ranks = oPool.roomList[socket.id].getRanks();
  ranks.addRankBall(constants.RANKS.DJ, selfProfile.getID());
  
  res = {};
  res[PF.TRACKLIST] = trackList;
  
  socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
  socket.emit(constants.IO_GET_TRACK_LIST, res);
  
  callback(null, null);
  
};