var GameError = require('../../game_error'),
  checkInput = require('../../check_input');
/*
 Отправить изменить статус игрока: Статус
 - Получаем свой профиль
 - Устанавливаем новый статус (пишем в БД)
 - Возвращаем клиенту новый статус
 */
module.exports = function (socket, userList) {
  socket.on('change_status', function(options) {
    if (!checkInput('change_status', socket, userList, options)) {
      return new GameError(socket, "CHANGESTATUS", "Верификация не пройдена");
    }

    var profile = userList[socket.id];
    profile.setStatus(options.status, function (err, status) {
      if (err) { return new GameError(socket, "CHANGESTATUS", err.message); }

      socket.emit('change_status', {status: status});
    })
  });
};


