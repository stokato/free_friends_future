var dbjs      = require('./../../db/index'),                // База
    GameError = require('./../../game_error'),
    checkInput = require('./../../check_input'),
    constants = require('./../constants');

var db = new dbjs();

/////////////////////////// ТОП ИГРОКОВ ///////////////////////////////////////////////////////////
/*
 Показать топ пользователей
 - Получаем установленное константой количество пользователей,
    отсартированных по очкам, начиная с требуемого количества очков
 - Отправляем клиенту
 */
module.exports = function (socket, userList) {
  socket.on(constants.IO_GET_TOP, function(options) { options = options || {};
    if (!checkInput(constants.IO_GET_TOP, socket, userList, options))  { return; }

    var max = options[constants.FIELDS.points];
    db.findPoints(max, function (err, users) {
      if (err) { return new GameError(socket, constants.IO_GET_TOP, err.message); }

      socket.emit(constants.IO_GET_TOP, users);
    });
  });
};

