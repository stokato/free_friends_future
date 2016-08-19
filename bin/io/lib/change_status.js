var GameError = require('../../game_error'),
    checkInput = require('../../check_input'),
    //sanitize        = require('../../sanitizer'),
    constants = require('./../../constants');

var oPool = require('./../../objects_pool');

/*
 Отправить изменить статус игрока: Статус
 - Получаем свой профиль
 - Устанавливаем новый статус (пишем в БД)
 - Возвращаем клиенту новый статус
 */
module.exports = function (socket) {
  socket.on(constants.IO_CHANGE_STATUS, function(options) {
    if (!checkInput(constants.IO_CHANGE_STATUS, socket, oPool.userList, options)) { return; }

    //options.status = sanitize(options.status);

    var selfProfile = oPool.userList[socket.id];
    selfProfile.setStatus(options.status, function (err, status) {
      if (err) { return handError(err); }

      var result = {};
      result.status = status;
      result.operation_status = constants.RS_GOODSTATUS;

      socket.emit(constants.IO_CHANGE_STATUS, result);
    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_CHANGE_STATUS, res);

      new GameError(socket, constants.IO_CHANGE_STATUS, err.message || constants.errors.OTHER.message);
    }
  });
};


