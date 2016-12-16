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
  
  // Оплачиваем трек
  selfProfile.pay(constants.TRACK_PRICE, function (err, money) {
    if(err) { return callback(err); }
    
    var res = {};
    res[PF.MONEY] = money;
    
    socket.emit(constants.IO_GET_MONEY, res);
  
    var track = {
      track_id    : options.track_id,
      id          : selfProfile.getID(),
      vid         : selfProfile.getVID(),
      likes       : 0,
      dislikes    : 0,
      duration    : options.duration
    };
    
    track[PF.TRACKID] = options[PF.TRACKID];
    track[PF.ID]      = selfProfile.getID();
    track[PF.VID]     = selfProfile.getVID();
    track[PF.LIKES]   = 0;
    track[PF.DISLIKES] = 0;
    track[PF.DURATION] = options[PF.DURATION];
    
    // Если очередь пустая, запускаем сразу
    if (trackList.length == 0) {
      mPlayer.setTrackTime(new Date());
      startTrack(socket, room, track);
    }
  
    mPlayer.addTrack(track);
    
    res = {};
    res[PF.TRACKLIST] = trackList;
  
    socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
    socket.emit(constants.IO_GET_TRACK_LIST, res);
  
    callback(null, null);
  });

  
  //-------------------------
  // function startTrack(socket, room, track, timerID) { timerID = timerID || null;
  //   var mPlayer = room.getMusicPlayer();
  //
  //   mPlayer.setTrackTime(new Date());
  //   var trackList = mPlayer.getTrackList();
  //
  //   timerID = setTimeout(function () {
  //     mPlayer.deleteTrack(track[PF.TRACKID]);
  //
  //     if (trackList.length > 0) {
  //       var newTrack = trackList[0];
  //       startTrack(socket, room, newTrack, timerID);
  //     }
  //
  //   }, track[PF.DURATION] * 1000);
  //
  //   mPlayer.setTimer(timerID);
  //
  //   var res = {};
  //   res[PF.TRACK]       = track;
  //   res[PF.PASSED_TIME] = 0;
  //
  //   socket.emit(constants.IO_START_TRACK, res);
  //   socket.broadcast.in(room.getName()).emit(constants.IO_START_TRACK, res);
  //
  //   res = {};
  //   res[PF.TRACKLIST] = trackList;
  //
  //   socket.emit(constants.IO_GET_TRACK_LIST, res );
  //   socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, res);
  // }
};