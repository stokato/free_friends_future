var constants = require('./../constants_io');
// Отправить сообщение всем в комнате
function sendInRoom(socket, room, message) {
    socket.broadcast.to(room.name).emit('message', message);
    socket.emit('message', message);

    room.messages.push(message);

    if (room.messages.length >= constants.LEN_ROOM_HISTORY) {
        room.messages.shift();
    }
}

module.exports = sendInRoom;