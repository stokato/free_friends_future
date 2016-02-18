var constants = require('./../constants_io');
// Отправить сообщение всем в комнате
module.exports = function (socket, room, message) {
  socket.broadcast.in(room.name).emit('message', message);
  socket.emit('message', message);

  room.messages.push(message);

  if (room.messages.length >= constants.LEN_ROOM_HISTORY) {
    room.messages.shift();
  }
};


