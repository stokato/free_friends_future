var GameError = require('../../game_error'),              // Ошибки
  checkInput = require('../../check_input'),            // Верификация
  constants  = require('../constants');

var async = require('async');


module.exports = function(socket, userList) {
  socket.on(constants.IO_ADD_TO_MENU, function() {
    if (!checkInput(constants.IO_ADD_TO_MENU, socket, userList, {})) {
      return;
    }

    var selfProfile = userList[socket.id];

    var result = {};

    if(selfProfile.isInMenu()) {
      result["status"] = 'fail';
      socket.emit(constants.IO_ADD_TO_MENU, result);

      return new GameError(socket, constants.IO_ADD_POINTS,
        "Ошибка при добавлении в меню, этот пользователь уже добавил свое приложение в меню");
    }

    async.waterfall([ ///////////////////////////////////////////////////////////////
      function(cb) { // Запоминаем, что пользователь добавил свое приложение в меню
        selfProfile.setInMenu(true, function(err, res) {
          if(err) { cb(err, null); }

          cb(null, null);
        });
      },/////////////////////////////////////////////////////////////////////////////
      function(res, cb) { // Получаем балан пользователя
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
      if(err) { new GameError(socket, constants.IO_ADD_POINTS,
        "Ошибка при добавлении в меню");}

      result["status"] = 'success';

      socket.emit(constants.IO_ADD_POINTS, result);

      result = {};
      result["money"] = money;

      socket.emit(constants.IO_GET_MONEY, result);
    });///////////////////////////////////////////////////////
  });
};
