var constants = require('./../../../constants');

// Отправить сообщение всем в комнате
module.exports = function (socket, room, message) {
  socket.broadcast.in(room.name).emit(constants.IO_MESSAGE, message);
  socket.emit(constants.IO_MESSAGE, message);

  room.messages.push(message);

  if (room.messages.length >= constants.LEN_ROOM_HISTORY) {
    room.messages.shift();
  }
};


