var constants = require('./../../constants'),
  checkInput = require('../../check_input');

var oPool = require('./../../objects_pool');

// Возвращаем плей-лист комнаты
module.exports = function(socket) {
  socket.on(constants.IO_GET_TRACK_LIST, function(options) {
    if (!checkInput(constants.IO_GET_TRACK_LIST, socket, options)) { return; }

    var room = oPool.roomList[socket.id];

    //socket.broadcast.in(room.name).emit(constants.IO_GET_TRACK_LIST, room.track_list);
    socket.emit(constants.IO_GET_TRACK_LIST, { track_list : room.track_list, operation_status : constants.RS_GOODSTATUS });
  });
};