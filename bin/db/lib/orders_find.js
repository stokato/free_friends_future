var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Найти все заказы пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {
  if(!userid) { return callback(new Error("Не задан ИД пользователя"), null); }

  //var f = C.IO.FIELDS;

  var fields = ["id", "vid", "goodid", "sum", "date"];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_ORDERS, ["userid"], [1]);

  this.client.execute(query,[userid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var orders = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {
      //var row = result.rows[i];

      //var order = {};
      //order[f.id]    = row[f.id].toString();
      //order[f.vid]     = row[f.vid];
      //order[f.sum]     = row[f.sum];
      //order[f.date]    = row[f.date];
      //order[f.goodid] = row[f.goodid];

      var order = result.rows[i];
      order.id = order.id.toString();

      orders.push(order);
    }

    callback(null, orders);
  });
};