var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) { options   = options || {};
  //var f = C.IO.FIELDS;

  var date    = options["date"] || new Date;

  if (!options["vid"] || !options["userid"] || !options["uservid"] || !options["sum"]) {
    return callback(new Error("Не задан один из параметров заказа"), null);
  }

  var id = this.uuid.random();

  var fields = ["id", "vid", "userid", "uservid", "sum", "date"];
  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_ORDERS);

  var params = [id, options["vid"], options["userid"], options["uservid"], options["sum"], date];

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });



};
