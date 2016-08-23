var db      = require('./../../db_manager'),
  GameError = require('./../../game_error'),
  checkInput = require('./../../check_input'),
  constants = require('./../../constants');

var oPool = require('./../../objects_pool');

/*
 Получить денежные лоты для пополнения счета пользователя
 - Получаем все возможные лоты из базы
 - Отправляем клиенту
 */
module.exports = function (socket) {
  socket.on(constants.IO_GET_MONEY_SHOP, function(options) {
    if (!checkInput(constants.IO_GET_MONEY_SHOP, socket, options)) { return; }

    db.findAllGoods(constants.GT_MONEY, function (err, goods) {
      if (err) {  return handError(err);  }

      socket.emit(constants.IO_GET_MONEY_SHOP, {
        lots: goods,
        operation_status: constants.RS_GOODSTATUS
      });
    });

    //-------------------------
    function handError(err, res) { res = res || {};
      res.operation_status = constants.RS_BADSTATUS;
      res.operation_error = err.code || constants.errors.OTHER.code;

      socket.emit(constants.IO_GET_MONEY_SHOP, res);

      new GameError(socket, constants.IO_GET_MONEY_SHOP, err.message || constants.errors.OTHER.message);
    }
  });
};


