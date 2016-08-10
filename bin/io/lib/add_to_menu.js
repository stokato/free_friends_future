var GameError = require('../../game_error'),              // Ошибки
  checkInput = require('../../check_input'),            // Верификация
  constants  = require('../constants');

var async = require('async');

module.exports = function(socket, userList) {
  socket.on(constants.IO_ADD_TO_MENU, function(options) {
    if (!checkInput(constants.IO_ADD_TO_MENU, socket, userList, options)) { return; }

    var selfProfile = userList[socket.id];

    if(selfProfile.isInMenu()) {
      return handError(constants.errors.ALREADY_IS_MENU);
    }

    async.waterfall([ ///////////////////////////////////////////////////////////////
      function(cb) { // Запоминаем, что пользователь добавил свое приложение в меню

        selfProfile.setInMenu(true, function(err, res) {
          if(err) { cb(err, null); }

          cb(null, null);
        });

      },/////////////////////////////////////////////////////////////////////////////
      function(res, cb) { // Получаем баланс пользователя

        selfProfile.getMoney(function (err, money) {
          if (err) {  cb(err, null); }

          cb(null, money);
        });

      },/////////////////////////////////////////////////////////////////////////////
      function(money, cb) { // Добавляем ему монет

        var newMoney = money + constants.MENU_BONUS;
        selfProfile.setMoney(newMoney, function (err, money) {
          if (err) {  cb(err, null); }

          cb(null, money);
        });

      }////////////////////////////////////////////////////////////////////
    ], function(err, money) { // Оповещаем об изменениях
      if(err) {  return handError(err);  }

      socket.emit(constants.IO_ADD_TO_MENU, { operation_status : constants.RS_GOODSTATUS });

      socket.emit(constants.IO_GET_MONEY, { money : money });
    });///////////////////////////////////////////////////////


    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_ADD_TO_MENU, res);

      new GameError(socket, constants.IO_ADD_TO_MENU, err.message || constants.errors.OTHER.message);
    }
  });
};


