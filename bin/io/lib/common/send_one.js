/**
 * Отправляем сообщение на указанный сокет
 *
 * @param socket, message
 */

const constants = require('./../../../constants');

// Отправить сообщение одному
module.exports = function (socket, message) {
  socket.emit(constants.IO_MESSAGE, message);
};

