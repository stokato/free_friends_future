// Вызвать эмиты у клиентов
module.exports = function(options, one) {
  if(one) {
    this.gSocket.emit('game', options);
  } else {
    this.gSocket.broadcast.in(this.gRoom.name).emit('game', options);
  }
};