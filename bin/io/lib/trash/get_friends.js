
var GameError = require('../../../game_error'),
  checkInput = require('../../../check_input');

/*
 Показать своих друзей
 - Получаем друзей - массив (ИД и дата начала дружбы) (из БД)
 - Передаем клиенту
 */
module.exports = function (socket, userList) {
  socket.on('get_friends', function() {
    if (!checkInput('get_friends', socket, userList, null)) {
      return new GameError(socket, "getFRIENDS", "Верификация не пройдена");
    }

    userList[socket.id].getFriends(function (err, friends) {
      if (err) {  return new GameError(socket, "getFRIENDS", err.message); }

      socket.emit('get_friends', friends);
    });
  });
};


