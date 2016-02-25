var async = require('async');

module.exports = function(options, callback) {
  var self = this;
  async.waterfall([ /////////////////////////////////////////////////////
    function(cb) { // Ищем товар в базе, проверяем, сходится ли цена
      self.dbManager.findGood(options.goodid, function (err, goodInfo) {
        if (err) { return cb(err, null) }

        if (goodInfo) {
          if(goodInfo.price != options.price)
            cb(new Error("Неверно указана цена товара"), null);
          else
            cb(null, goodInfo);
        } else cb(new Error("Нет такого подарка"), null);
      });
    },/////////////////////////////////////////////////////////////////
    function(goodInfo, cb) { // Ищем пользователя в базе
      self.dbManager.findUser(null, options.vid, [], function(err, info) {
        if(err) { return cb(err, null); }

        if (info) {
          cb(null, goodInfo, info);
        } else cb(new Error("Нет такого пользователя"), null);
      });
    },/////////////////////////////////////////////////////////////////////
    function(goodInfo, info, cb) { // Сохраняем заказ и возвращаем внутренний ид заказа
      var options = {
        vid     : options.ordervid,
        goodid  : goodInfo.id,
        userid  : info.id,
        uservid : info.vid,
        sum     : goodInfo.price,
        date    : new Date()
      };

      self.dbManager.addOrder(options, function(err, orderid) {
        if (err) { return cb(err, null); }

        cb(null, {orderid : orderid});
      });
    } ///////////////////////////////////////////////////////////////////////////////
  ], function(err, res) { // Обрабатываем ошибки и возвращаем результат
    if(err) { return callback(err, null); }

    callback(null, res);
  })

};