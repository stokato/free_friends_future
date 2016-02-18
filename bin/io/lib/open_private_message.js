var GameError = require('../../game_error'),
  checkInput = require('../../check_input');
/*
 Пометить сообщение как октрытое
 */
module.exports = function (socket, userList) {
  socket.on('open_private_message', function(options) {
    if (!checkInput('open_private_message', socket, userList, null))
      return new GameError(socket, "OPENMESSAGE", "Верификация не пройдена");

    userList[socket.id].openMessage(options, function (err) {
      if (err) { return new GameError(socket, "OPENMESSAGE", err.message); }

      socket.emit('open_private_message', options);
    })
  });
};


