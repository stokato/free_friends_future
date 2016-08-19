var GameError = require('../../game_error'),
  checkInput = require('../../check_input'),
  constants = require('./../../constants');

var oPool = require('./../../objects_pool');

// Добавляем дизлайк к треку
module.exports = function(socket) {
  socket.on(constants.IO_DISLIKE_TRACK, function(options) {
    if (!checkInput(constants.IO_DISLIKE_TRACK, socket, oPool.userList, options)) { return; }

    var room = oPool.roomList[socket.id];
    var selfProfile = oPool.userList[socket.id];
    var id = selfProfile.getID();

    var isTrack = false;
    for(var i = 0; i < room.track_list.length; i++) {
      if(room.track_list[i].track_id == options.track_id) {
        if(!room.dislikers[room.track_list[i].track_id][id]) {
          room.track_list[i].dislikes++;
          room.dislikers[room.track_list[i].track_id][id] = true;
        }
        if(room.likers[room.track_list[i].track_id][id]) {
          room.likers[room.track_list[i].track_id][id] = false;
          room.track_list[i].likes--;
          if(room.track_list[i].likes < 0) {
            room.track_list[i].likes = 0;
          }
        }
        isTrack = true;
      }
    }

    if(!isTrack) {
      return handError(constants.errors.NO_SUCH_TRACK);
    }

    socket.emit(constants.IO_DISLIKE_TRACK, { operation_status : constants.RS_GOODSTATUS });

    socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list });
    socket.emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list});

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_DISLIKE_TRACK, res);

      new GameError(socket, constants.IO_DISLIKE_TRACK, err.message || constants.errors.OTHER.message);
    }
  });
};