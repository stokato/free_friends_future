var sendOne = require('./send_one');

// Показать последние сообщения
module.exports = function (socket, room) {
  var messages = room.getMessages();

  for(var i = 0; i < messages.length; i++) {
    sendOne(socket, messages[i]);
  }
};


