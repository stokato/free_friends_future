/**
 * Отправляем пользователю последние сообщения общего чата
 */

var PF = require('./../../../constants').PFIELDS;
var oPool = require('./../../../objects_pool');
var sendOne = require('./send_one');

module.exports = function (socket, room) {
  var messages = room.getMessages();
  
  var selfProfile = oPool.userList[socket.id];
  
  // Проверяем, если отправитель сообщения не в черном списке этого пользователя
  // Отправляем ему сообщение
  for(var i = 0; i < messages.length; i++) {
    if(!selfProfile.isInBlackList(messages[i][PF.ID])) {
      sendOne(socket, messages[i]);
    }
  }
};