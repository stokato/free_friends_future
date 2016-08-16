var GameError = require('../../game_error'),
  checkInput = require('../../check_input'),
  constants = require('./../../constants');


// Добавляем трек в очередь плей-листа комнаты
module.exports = function(socket, userList, roomList) {
  socket.on(constants.IO_ADD_TRECK, function(options) {
    if (!checkInput(constants.IO_ADD_TRECK, socket, userList, options)) { return; }

    var selfProfile = userList[socket.id];
    var room = roomList[socket.id];

    for(var i = 0; i < room.track_list.length; i++) {
      if(room.track_list[i].track_id == options.track_id) {
        return handError(constants.errors.ALREADY_IS_TRACK);
      }
    }

    room.track_list.push({
      track_id : options.track_id,
      id       : selfProfile.getID(),
      vid      : selfProfile.getVID(),
      likes    : 0,
      dislikes : 0
    });

    room.likers[options.track_id] = {};
    room.dislikers[options.track_id] = {};

    setTimeout((function(track_id, track_list){
      return function() {
        for(var i = 0; i < track_list.length; i++) {
          if(track_list[i].track_id == track_id) {
            track_list.splice(i, 1);
          }
        }
      }
    })(options.track_id, room.track_list), options.duration * 1000);

    socket.emit(constants.IO_ADD_TRECK, { operation_status : constants.RS_GOODSTATUS });

    socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list });
    socket.emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list });


    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_ADD_TRECK, res);

      new GameError(socket, constants.IO_ADD_TRECK, err.message || constants.errors.OTHER.message);
    }
  });
};