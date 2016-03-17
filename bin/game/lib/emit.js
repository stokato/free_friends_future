var constants_io = require('../../io/constants');
// Вызвать эмиты у клиентов
module.exports = function(socket, options, one) {
  if(one) {
    socket.emit(constants_io.IO_GAME, options);
  } else {
    socket.emit(constants_io.IO_GAME, options);
    socket.broadcast.in(this.gRoom.name).emit(constants_io.IO_GAME, options);
  }
};