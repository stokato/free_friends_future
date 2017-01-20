/**
 * Отправляем сообщение на указанный сокет
 *
 * @param socket, message
 */

const Config = require('./../../../../config.json');

module.exports = function (socket, message) {
  socket.emit(Config.io.emits.IO_MESSAGE, message);
};

