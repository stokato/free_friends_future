/**
 * Отправляем сообщение всем в комнате
 */

var constants = require('./../../../constants');

module.exports = function (socket, room, message) {
  socket.broadcast.in(room.getName()).emit(constants.IO_MESSAGE, message);
  socket.emit(constants.IO_MESSAGE, message);

  var messages = room.getMessages();
  
  messages.push(message);

  if (messages.length >= constants.LEN_ROOM_HISTORY) {
    messages.shift();
  }
};


