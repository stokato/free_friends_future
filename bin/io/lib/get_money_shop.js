var dbjs      = require('./../../db/index'),
  GameError = require('./../../game_error'),
  checkInput = require('./../../check_input'),
  constants = require('./../constants');

var db = new dbjs();
/*
 Получить денежные лоты для пополнения счета пользователя
 - Получаем все возможные лоты из базы
 - Отправляем клиенту
 */
module.exports = function (socket, userList) {
  socket.on(constants.IO_GET_MONEY_SHOP, function() {
    if (!checkInput(constants.IO_GET_MONEY_SHOP, socket, userList, {})) { return; }

    db.findAllGoods(constants.GT_MONEY, function (err, goods) {
      if (err) { return new GameError(socket, constants.IO_GET_MONEY_SHOP, err.message); }

      socket.emit(constants.IO_GET_MONEY_SHOP, goods);
    });
  });
};


