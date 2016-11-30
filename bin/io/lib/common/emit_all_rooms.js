/**
 * Отправляем всем аутентифицированным клиентам
 *
 * @param socket, emit, message
 */

var oPool = require('./../../../objects_pool');

module.exports = function (socket, emit, message) {
 
  var rooms = oPool.rooms;
  for(var r in rooms)  if (rooms.hasOwnProperty(r)) {
    socket.broadcast.in(rooms[r].getName()).emit(emit, message);
  }
  
};