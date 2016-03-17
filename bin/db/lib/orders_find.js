var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти все заказы пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {
  if(!userid) { return callback(new Error("Не задан ИД пользователя"), null); }

  var f = C.IO.FIELDS;

  var fields = [f.id, f.vid, f.goodid, f.sum, f.date];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_ORDERS, [f.userid], [1]);

  this.client.execute(query,[userid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var orders = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {
      var row = result.rows[i];

      var order = {};
      order[f.id]    = row[f.id].toString();
      order[f.vid]     = row[f.vid];
      order[f.sum]     = row[f.sum];
      order[f.date]    = row[f.date];
      order[f.goodid] = row[f.goodid];

      orders.push(order);
    }

    callback(null, orders);
  });
};