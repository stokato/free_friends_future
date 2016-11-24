var db        = require('./../../../db_manager'),
    constants = require('./../../../constants');

/*
 Получить денежные лоты для пополнения счета пользователя
 - Получаем все возможные лоты из базы
 - Отправляем клиенту
 */
module.exports = function (socket, options, callback) {

    db.findAllGoods(constants.GT_MONEY, function (err, goods) {
      if (err) {  return callback(err);  }
      
      var res = {};
      res[constants.PFIELDS.LOTS] = goods;
      
      callback(null, res);
    });

};


