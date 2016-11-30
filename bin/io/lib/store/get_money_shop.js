/**
 *  Получаем набор лотов для пополнения баланса
 *
 *  @param socket, options, callback
 *  @return {Object} - объект со списом лотов
 */

var db        = require('./../../../db_manager'),
    constants = require('./../../../constants');

module.exports = function (socket, options, callback) {

    db.findAllGoods(constants.GT_MONEY, function (err, goods) {
      if (err) {  return callback(err);  }
      
      var res = {};
      res[constants.PFIELDS.LOTS] = goods;
      
      callback(null, res);
    });

};


