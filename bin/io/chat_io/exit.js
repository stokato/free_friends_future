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
function exit(socket, userList, profiles, roomList, rooms) {
    socket.on('exit', function() {
        userList[socket.id].setExitTimeout(
            setTimeout(function(){
                closeConnection(socket, userList, profiles, roomList, rooms)
            }, constants.EXIT_TIMEOUT))
    });
} // Выходим из чата

module.exports = exit;