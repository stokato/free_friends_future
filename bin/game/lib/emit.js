var constants = require('../../constants');

// Вызвать эмиты у клиентов
// Если передан сокет, шлем только на него, если нет
// берем первый попавшийся и рассылаем в комнату
module.exports = function(options, socket) {

  if(socket) {
    socket.emit(constants.IO_GAME, options);
  } else {
    socket = getSocket(this.gRoom);
    if(socket) {
      socket.emit(constants.IO_GAME, options);
      socket.broadcast.in(this.gRoom.name).emit(constants.IO_GAME, options);

    } else {
      this.stop();
    }
  }
};


function getSocket(room) {
  var player = null;

  for(var guy in room.guys) if(room.guys.hasOwnProperty(guy)) {
    player = room.guys[guy];
    break;
  }
  if(!player) {
    for(var girl in room.girls) if(room.girls.hasOwnProperty(girl)) {
      player = room.girls[girl];
      break;
    }
  }

  if(!player) {
    return false;
  }

  return player.getSocket();
}