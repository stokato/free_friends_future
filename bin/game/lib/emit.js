// Вызвать эмиты у клиентов
module.exports = function(socket, options, one) {
  if(one) {
    socket.emit('game', options);
  } else {
    socket.emit('game', options);
    socket.broadcast.in(this.gRoom.name).emit('game', options);
  }
};