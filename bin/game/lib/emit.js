// Вызвать эмиты у клиентов
module.exports = function(options, one) {
  if(one) {
    this.gSocket.emit(options);
  } else {
    this.gSocket.broadcast.to(this.gRoom.name).emit(stage, options);
  }
};