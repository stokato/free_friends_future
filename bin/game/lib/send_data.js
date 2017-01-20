/**
 * Отпрвить данные
 * Если передан сокет, шлем только на него, если нет
 * берем первый попавшийся и рассылаем в комнату
 */

const Config = require('./../../../config.json');

const IO_GAME = Config.io.emits.IO_GAME;

module.exports = function(options, socket = null) {

  if(socket) {
    socket.emit(IO_GAME, options);
  } else {
    socket = this._room.getAnySocket();
    
    if(socket) {
      socket.emit(IO_GAME, options);
      socket.broadcast.in(this._room.getName()).emit(IO_GAME, options);

    } else { // Если нет ни одного - останавливаем игру
      this.stop();
    }
  }
};
