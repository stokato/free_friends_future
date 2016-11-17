var constants  = require('./../../../constants');            // Верификация

var oPool = require('./../../../objects_pool');

// Добавляем трек в очередь плей-листа комнаты
module.exports = function(socket, options, callback) {
  
  var selfProfile = oPool.userList[socket.id];
  var room = oPool.roomList[socket.id];
  
  // Проверяем - есть ли такой трек в очереди
  for (var i = 0; i < room.track_list.length; i++) {
    if (room.track_list[i].track_id == options.track_id) {
      return callback(constants.errors.ALREADY_IS_TRACK);
    }
  }
  
  // Оплачиваем трек
  selfProfile.pay(constants.TRACK_PRICE, function (err) {
    if(err) { return callback(err); }
  
    var track = {
      track_id    : options.track_id,
      id          : selfProfile.getID(),
      vid         : selfProfile.getVID(),
      likes       : 0,
      dislikes    : 0,
      duration    : options.duration
    };
    
    var trackList = room.getTrackList();
    
    // Если очередь пустая, запускаем сразу
    if (trackList.length == 0) {
      room.setTrackTime(new Date());
      startTrack(socket, room, track);
    }
    
    room.addTrack(track);
    
    // socket.emit(constants.IO_ADD_TRECK, {operation_status: constants.RS_GOODSTATUS});
  
    socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, {track_list: trackList});
    socket.emit(constants.IO_GET_TRACK_LIST, {track_list: trackList});
  
    callback(null, null);
  });

  
  //-------------------------
  function startTrack(socket, room, track, timerID) { timerID = timerID || null;
    room.setTrackTime(new Date());
    
    var trackList = room.getTrackList();
    
    timerID = setTimeout(function () {
      room.deleteTrack(track.track_id);
      
      if (trackList.length > 0) {
        var newTrack = trackList[0];
        startTrack(socket, room, newTrack, timerID);
      }
      
    }, track.duration * 1000);
    
    var options = {track: track, passed_time: 0};
    socket.emit(constants.IO_START_TRACK, options);
    socket.broadcast.in(room.getName()).emit(constants.IO_START_TRACK, options);
    
    socket.emit(constants.IO_GET_TRACK_LIST, {track_list: trackList} );
    socket.broadcast.in(room.getName()).emit(constants.IO_GET_TRACK_LIST, {track_list: trackList});
  }
};