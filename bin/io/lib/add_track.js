var constants = require('./../../constants'),
    GameError = require('../../game_error'),
    checkInput = require('../../check_input');

var oPool = require('./../../objects_pool');

// Добавляем трек в очередь плей-листа комнаты
module.exports = function(socket) {
  socket.on(constants.IO_ADD_TRECK, function(options) {
    if (!checkInput(constants.IO_ADD_TRECK, socket, options)) {
      return;
    }

    var selfProfile = oPool.userList[socket.id];
    var room = oPool.roomList[socket.id];

    for (var i = 0; i < room.track_list.length; i++) {
      if (room.track_list[i].track_id == options.track_id) {
        return handError(constants.errors.ALREADY_IS_TRACK);
      }
    }

    if (room.track_list.length == 0) {
      room.trackTime = new Date();
    }

    var track = {
      track_id: options.track_id,
      id: selfProfile.getID(),
      vid: selfProfile.getVID(),
      likes: 0,
      dislikes: 0,
      duration: options.duration
    };

    if (room.track_list.length == 0) {
      startTrack(socket, room, track);
    }

    room.track_list.push(track);

    room.likers[options.track_id] = {};
    room.dislikers[options.track_id] = {};

    socket.emit(constants.IO_ADD_TRECK, {operation_status: constants.RS_GOODSTATUS});

    socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, {track_list: room.track_list});
    socket.emit(constants.IO_GET_TRACK_LIST, {track_list: room.track_list});


    //-------------------------
    function handError(err, res) {
      res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_ADD_TRECK, res);

      new GameError(socket, constants.IO_ADD_TRECK, err.message || constants.errors.OTHER.message);
    }

    /////////////////////////////////////////////////
    function startTrack(socket, room, track, timerID) { timerID = timerID || null;
      room.trackTime = new Date();

      timerID = setTimeout(function () {
        for (var i = 0; i < room.track_list.length; i++) {
          if (room.track_list[i].track_id == track.track_id) {
            room.track_list.splice(i, 1);
            break;
          }
        }

        if (room.track_list.length > 0) {
          var newTrack = room.track_list[0];
          startTrack(socket, room, newTrack, timerID);
        }

      }, track.duration * 1000);

      var options = {track: track, passed_time: 0};
      socket.emit(constants.IO_START_TRACK, options);
      socket.broadcast.in(room.name).emit(constants.IO_START_TRACK, options);

      socket.emit(constants.IO_GET_TRACK_LIST, {track_list: room.track_list} );
      socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, {track_list: room.track_list});
    }

  });
};