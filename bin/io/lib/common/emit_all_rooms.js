/**
 * Отправляем всем аутентифицированным клиентам
 *
 * @param socket, emit, message
 */

const oPool = require('./../../../objects_pool');

module.exports = function (socket, emit, message) {
 
  let  rooms = oPool.rooms;
  for(let  r in rooms)  if (rooms.hasOwnProperty(r)) {
    socket.broadcast.in(rooms[r].getName()).emit(emit, message);
  }
  
};