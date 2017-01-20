/**
 * Отправляем сообщение всем в комнате
 */

const Config = require('./../../../../config.json');
const  oPool = require('./../../../objects_pool');

module.exports = function (socket, room, message) {
  
  const LEN_ROOM_HISTORY = Config.io.len_room_history;
  //socket.broadcast.in(room.getName()).emit(cFields.IO_MESSAGE, message);
  
  socket.emit(Config.io.emits.IO_MESSAGE, message);

  let  selfId = oPool.userList[socket.id].getID();
  
  // Получаем пользователей в комнате и проверяем,
  // не находится ли отправитель в их черном списке
  // Отправляем сообщение
  
  let  usersArr = room.getAllPlayers();
  usersArr.forEach((item, i, arr) => {
    if(item.getID() != selfId && !item.isInBlackList(selfId)) {
      
      item.getSocket().emit(Config.io.emits.IO_MESSAGE, message);
    }
  });
  
  // Сохраняем сообщение в истории
  let  messagesArr = room.getMessages();
  messagesArr.push(message);

  if (messagesArr.length >= LEN_ROOM_HISTORY) {
    messagesArr.shift();
  }
};


