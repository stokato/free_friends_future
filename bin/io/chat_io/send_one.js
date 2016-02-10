// Отправить сообщение одному
function sendOne(socket, message) {
    socket.emit('message', message);
}

module.exports = sendOne;