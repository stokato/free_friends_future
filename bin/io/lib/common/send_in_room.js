/**
 * Отправляем сообщение всем в комнате
 */

const  constants = require('./../../../constants');
const  oPool = require('./../../../objects_pool');

module.exports = function (socket, room, message) {
  //socket.broadcast.in(room.getName()).emit(constants.IO_MESSAGE, message);
  socket.emit(constants.IO_MESSAGE, message);

  let  selfId = oPool.userList[socket.id].getID();
  
  // Получаем пользователей в комнате и проверяем,
  // не находится ли отправитель в их черном списке
  // Отправляем сообщение
  let  users = room.getAllPlayers();
  users.forEach(function (item, i, arr) {
    if(item.getID() != selfId && !item.isInBlackList(selfId)) {
      item.getSocket().emit(constants.IO_MESSAGE, message);
    }
  });
  
  let  messages = room.getMessages();
  
  messages.push(message);

  if (messages.length >= constants.LEN_ROOM_HISTORY) {
    messages.shift();
  }
};


