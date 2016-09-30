var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Найти все заказы пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {
  if(!userid) { return callback(new Error("Не задан ИД пользователя"), null); }

  var fields = ["id", "vid", "goodid", "sum", "date"];
  var constFields = ["userid"];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_ORDERS, constFields, constValues);

  cdb.client.execute(query,[userid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var orders = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {

      var order = result.rows[i];
      order.id = order.id.toString();

      orders.push(order);
    }

    callback(null, orders);
  });
};