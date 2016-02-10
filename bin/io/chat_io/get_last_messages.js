var sendOne = require('./send_one');

// Показать последние сообщения
function getLastMessages(socket, room) {
    var messages = room.messages;

    for(var i = 0; i < messages.length; i++) {
        sendOne(socket, messages[i]);
    }
}

module.exports = getLastMessages;