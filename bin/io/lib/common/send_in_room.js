/**
 * Отправляем сообщение всем в комнате
 */

var constants = require('./../../../constants');
var oPool = require('./../../../objects_pool');

module.exports = function (socket, room, message) {
  //socket.broadcast.in(room.getName()).emit(constants.IO_MESSAGE, message);
  socket.emit(constants.IO_MESSAGE, message);

  var selfId = oPool.userList[socket.id].getID();
  
  // Получаем пользователей в комнате и проверяем,
  // не находится ли отправитель в их черном списке
  // Отправляем сообщение
  var users = room.getAllPlayers();
  for(var i = 0; i < users.length; i++) {
    if(users[i].getID() != selfId && !users[i].isInBlackList(selfId)) {
      users[i].getSocket().emit(constants.IO_MESSAGE, message);
    }
  }
  
  var messages = room.getMessages();
  
  messages.push(message);

  if (messages.length >= constants.LEN_ROOM_HISTORY) {
    messages.shift();
  }
};


