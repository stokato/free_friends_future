/**
 * Отправляем пользователю последние сообщения общего чата
 */


const  oPool    = require('./../../../objects_pool');
const  sendOne  = require('./send_one');
const  PF       = require('./../../../const_fields');

module.exports = function (socket, room) {
  let  messagesArr = room.getMessages();
  
  let  selfProfile = oPool.userList[socket.id];
  
  // Проверяем, если отправитель сообщения не в черном списке этого пользователя
  // Отправляем ему сообщение
  let messagesCount = messagesArr.length;
  
  for(let  i = 0; i < messagesCount; i++) {
    if(!selfProfile.isInBlackList(messagesArr[i][PF.ID])) {
      sendOne(socket, messagesArr[i]);
    }
  }
};