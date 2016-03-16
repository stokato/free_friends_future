var dbjs      = require('./../../db/index'),
    GameError = require('./../../game_error'),
    checkInput = require('./../../check_input'),
    constants = require('./../constants');

var db = new dbjs();
/*
 Получить магазин с подарками
 - Получаем все возможные подарки из базы
 - Отправляем клиенту
 */
module.exports = function (socket, userList) {
  socket.on(constants.IO_GET_SHOP, function() {
    if (!checkInput(constants.IO_GET_SHOP, socket, userList, null)) { return; }

    db.findAllGoods(function (err, goods) {
      if (err) { return new GameError(socket, constants.IO_GET_SHOP, err.message); }

      socket.emit(constants.IO_GET_SHOP, goods);
    });
  });
};


