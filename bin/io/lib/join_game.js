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

    userList[socket.id].setReady(true);

    var room = roomList[socket.id];
    var allReady = true;

    var item, guy, girl;
    for (item in room.guys) if(room.guys.hasOwnProperty(item)) {
      guy = room.guys[item];
      if (!guy.getReady()) allReady = false;
    }
    for (item in room.girls) if(room.girls.hasOwnProperty(item)) {
      girl = room.girls[item];
      if (!girl.getReady()) allReady = false;
    }

    if (allReady) room.game.start();
  });
};


