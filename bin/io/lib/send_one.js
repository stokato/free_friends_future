// Отправить сообщение одному
module.exports = function (socket, message) {
 socket.emit('message', message);
};

