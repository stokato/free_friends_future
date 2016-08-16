var checkInput = require('../../check_input'),
  constants = require('./../../constants');


// Возвращаем плей-лист комнаты
module.exports = function(socket, userList, roomList) {
  socket.on(constants.IO_GET_TRACK_LIST, function(options) {
    if (!checkInput(constants.IO_GET_TRACK_LIST, socket, userList, options)) { return; }

    var room = roomList[socket.id];

    //socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, room.track_list);
    socket.emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list, operation_status : constants.RS_GOODSTATUS });
  });
};