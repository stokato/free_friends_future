/**
 * Отправляем пользователю последние сообщения общего чата
 */


const  oPool    = require('./../../../objects_pool');
const  sendOne  = require('./send_one');
const  PF       = require('./../../../const_fields');

module.exports = function (socket, room) {
  let  messages = room.getMessages();
  
  let  selfProfile = oPool.userList[socket.id];
  
  // Проверяем, если отправитель сообщения не в черном списке этого пользователя
  // Отправляем ему сообщение
  for(let  i = 0; i < messages.length; i++) {
    if(!selfProfile.isInBlackList(messages[i][PF.ID])) {
      sendOne(socket, messages[i]);
    }
  }
};