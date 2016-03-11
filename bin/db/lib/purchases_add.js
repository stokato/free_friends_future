/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) {
  var order   = options || {};
  var userid  = order.userid;
  var goodid = order.goodid;

  if (!orderid || !userid) {
    return callback(new Error("Не задан один из параметров покупки"), null);
  }

  var id = this.uuid.random();

  var fields = "id, userid, goodid";
  var values = "?, ?, ?, ?, ?, ?";

  var params = [id, userid, goodid];

  var query = "INSERT INTO user_goods (" + fields + ") VALUES (" + values + ")";

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};
