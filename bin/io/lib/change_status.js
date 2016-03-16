var GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    constants = require('./../constants');
/*
 Отправить изменить статус игрока: Статус
 - Получаем свой профиль
 - Устанавливаем новый статус (пишем в БД)
 - Возвращаем клиенту новый статус
 */
module.exports = function (socket, userList) {
  socket.on(constants.IO_CHANGE_STATUS, function(options) {
    if (!checkInput(constants.IO_CHANGE_STATUS, socket, userList, options)) {
      return;
    }

    var f = constants.FIELDS;

    var selfProfile = userList[socket.id];
    selfProfile.setStatus(options[f.status], function (err, status) {
      if (err) { return new GameError(socket, constants.IO_CHANGE_STATUS, err.message); }

      var result = {};
      result[f.status] = status;
      socket.emit(constants.IO_CHANGE_STATUS, result);
    })
  });
};


