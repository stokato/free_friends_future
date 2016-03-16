var constants = require('./../constants');
    closeConnection = require('./close_connection');

/*
 Выходим (отключаемся)
 - получаем свой профиль и комнату
 - сообщаем все в комнате об уходе
 - сохраняем профиль в БД
 - удаляем профиль и комнату из памяти
 - отключаем сокет
 */
module.exports = function (socket, userList, profiles, roomList, rooms) {
  socket.on(constants.IO_DISCONNECT, function() {
    var selfProfile = userList[socket.id];
    if(selfProfile) {
      selfProfile.setExitTimeout(
        setTimeout(function(){
          closeConnection(socket, userList, profiles, roomList, rooms);
        }, constants.EXIT_TIMEOUT));
    }
  });
}; // Выходим из чата

