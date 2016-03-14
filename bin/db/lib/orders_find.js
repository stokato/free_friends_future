/*
 Найти все заказы пользователя: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(userid, callback) {

  if(!userid) { return callback(new Error("Не задан ИД пользователя"), null); }

  var query = "select id, vid, goodid, sum, date FROM orders where userid = ?";

  this.client.execute(query,[userid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var orders = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {
      var row = result.rows[i];

      var order = {
        id: row.id.toString(),
        vid: row.vid,
        sum: row.sum || 0,
        date: row.date,
        goodid: row.goodid
      };

      orders.push(order);
    }

    callback(null, orders);
  });
};