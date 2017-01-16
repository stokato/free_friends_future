const constants = require('../../constants');

// Вызвать эмиты у клиентов
// Если передан сокет, шлем только на него, если нет
// берем первый попавшийся и рассылаем в комнату
module.exports = function(options, socket) {

  if(socket) {
    socket.emit(constants.IO_GAME, options);
  } else {
    socket = this._room.getAnySocket();
    if(socket) {
      socket.emit(constants.IO_GAME, options);
      socket.broadcast.in(this._room.getName()).emit(constants.IO_GAME, options);

    } else {
      this.stop();
    }
  }
};
