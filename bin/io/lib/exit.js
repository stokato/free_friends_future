var constants = require('./../constants_io');
var closeConnection = require('./close_connection');

/*
 Выходим (отключаемся)
 - получаем свой профиль и комнату
 - сообщаем все в комнате об уходе
 - сохраняем профиль в БД
 - удаляем профиль и комнату из памяти
 - отключаем сокет
 */
module.exports = function (socket, userList, profiles, roomList, rooms) {
    socket.on('exit', function() {
        socket.disconnect();
        userList[socket.id].setExitTimeout(
            setTimeout(function(){
                closeConnection(socket, userList, profiles, roomList, rooms);
            }, constants.EXIT_TIMEOUT))
    });
} // Выходим из чата

