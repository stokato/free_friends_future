var GameError = require('../../game_error'),
    checkInput = require('../../check_input');
var sendInRoom = require('./send_in_room');
/*
 Отправляем сообщение в комнату
 - Получаем свой профиль и комнату
 - Отправляем сообщение всем в комнате (и себе)
 */
function sendPublicMessage(socket, userList, roomList) {
    socket.on('message', function(message) {
        if (!checkInput('message', socket, userList, message))
            return new GameError(socket, "SENDPUBMESSAGE", "Верификация не пройдена");

        var profile = userList[socket.id];
        var info = {
            id: profile.getID(),
            vid: profile.getVID(),
            text: message.text,
            date: new Date()
        };
        var currRoom = roomList[socket.id];

        sendInRoom(socket, currRoom, info);
    });
}

module.exports = sendPublicMessage;