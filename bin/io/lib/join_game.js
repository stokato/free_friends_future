var GameError = require('../../game_error'),              // Ошибки
    checkInput = require('../../check_input'),            // Верификация
    constants = require('./../constants');

// присоединиться к игре
// Ставим игроку статус - готов к игре
// Проверяем - если все готовы - стартуем игру
module.exports = function (socket, userList, roomList) {
  socket.on(constants.IO_JOIN_GAME, function() {
    if (!checkInput(constants.IO_JOIN_GAME, socket, userList, {})) { return; }

    var f = constants.FIELDS;
    var selfProfile = userList[socket.id];
    if(!selfProfile.getInPrison()) {
      selfProfile.setInPrison(true);

      var room = roomList[socket.id];

      var info = {};
      info[f.id]  = selfProfile.getID();
      info[f.vid] = selfProfile.getVID();

      socket.emit(constants.IO_JOIN_GAME, info);
      socket.in(room.name).emit(constants.IO_JOIN_GAME, info);

      room.game.start(socket);
    }
  });
};


