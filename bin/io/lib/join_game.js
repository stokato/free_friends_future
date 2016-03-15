var GameError = require('../../game_error'),              // Ошибки
    checkInput = require('../../check_input');            // Верификация

// присоединиться к игре
// Ставим игроку статус - готов к игре
// Проверяем - если все готовы - стартуем игру
module.exports = function (socket, userList, roomList) {
  socket.on('join_game', function() {

    if (!checkInput('join_game', socket, userList, null)) {
      return new GameError(socket, "JOINGAME", "Верификация не пройдена");
    }

    var selfProfile = userList[socket.id];
    if(!selfProfile.getReady()) {
      selfProfile.setReady(true);

      var room = roomList[socket.id];

      var info = { id: selfProfile.getID(), vid: selfProfile.getVID() };
      socket.emit('join_game', info);
      socket.in(room.name).emit('join_game', info);

      room.game.start(socket);
    }
  });
};


