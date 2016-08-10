var dbjs       = require('./../../db/index'),                // База
    GameError  = require('./../../game_error'),
    checkInput = require('./../../check_input'),
    profilejs  = require('../../profile/index'),
    constants  = require('./../constants');

var db = new dbjs();

/////////////////////////// ТОП ИГРОКОВ ///////////////////////////////////////////////////////////
/*
 Показать топ пользователей
 - Получаем пользоватлей, всех вместе и по полам
 - Отправляем клиенту
 */
module.exports = function (socket) {
  socket.on(constants.IO_GET_TOP, function(options) {

    var res = {};
    db.findPoints(null, function (err, users) {
      if (err) { return handError(options, err.message); }
      res.all = users;

      db.findPoints(constants.GIRL, function (err, users) {
        if (err) { return handError(options, err.message); }
        res.girls = users;

        db.findPoints(constants.GUY, function (err, users) {
          if (err) { return handError(options, err.message); }

          res.guys = users;
          res.operation_status = constants.RS_GOODSTATUS;

          socket.emit(constants.IO_GET_TOP, res);
        });
      });
    });


    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GET_TOP, res);

      new GameError(socket, constants.IO_GET_TOP, err.message || constants.errors.OTHER.message);
    }
  });
};

