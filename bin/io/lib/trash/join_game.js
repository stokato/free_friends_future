var GameError = require('../../../game_error'),              // Ошибки
    checkInput = require('../../../check_input'),            // Верификация
    constants = require('./../../../constants');

// присоединиться к игре
// Ставим игроку статус - готов к игре
// Проверяем - если все готовы - стартуем игру
module.exports = function (socket, userList, roomList) {
  socket.on(constants.IO_JOIN_GAME, function(options) {
    if (!checkInput(constants.IO_JOIN_GAME, socket, userList, options)) { return; }

    var selfProfile = userList[socket.id];

    var room = roomList[socket.id];

    var info = {
      id    : selfProfile.getID(),
      vid   : selfProfile.getVID()
    };

    socket.emit(constants.IO_JOIN_GAME, info);
    socket.in(room.name).emit(constants.IO_JOIN_GAME, info);

    room.game.start(socket);

  });
};


