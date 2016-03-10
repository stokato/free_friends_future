/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) {
  var order   = options || {};
  var vid     = order.vid;
  var userid  = order.userid;
  var uservid = order.uservid;
  var sum     = order.sum;
  var date    = order.date || new Date;

  if (!vid || !userid || !uservid || !sum) {
    return callback(new Error("Не задан один из параметров заказа"), null);
  }

  var id = this.uuid.random();

  var fields = "id, vid, userid, uservid, sum, date";
  var values = "?, ?, ?, ?, ?, ?";

  var params = [id, vid, userid, uservid, sum, date];

  var query = "INSERT INTO orders (" + fields + ") VALUES (" + values + ")";

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};
