var GameError = require('../../game_error'),
    checkInput = require('../../check_input');
/*
 Показать свои подарки (полученные)
 - Получаем подарки - массив подарков со всеми свойствами (из БД)
 - Передаем клиенту
 */
module.exports = function (socket, userList) {
  socket.on('get_guests', function() {
    if (!checkInput('get_guests', socket, userList, null)) {
      return new GameError(socket, "GETGUESTS", "Верификация не пройдена");
    }

    userList[socket.id].getGuests(function (err, guests) {
      if (err) { return new GameError(socket, "GETGUESTS", err.message); }

      socket.emit('get_guests', guests);
    });
  });
};


