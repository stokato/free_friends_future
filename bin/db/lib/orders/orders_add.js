var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) { options   = options || {};

  var date    = options["date"] || new Date;

  if (!options["vid"] || !options["userid"] || !options["uservid"] || !options["sum"]) {
    return callback(new Error("Не задан один из параметров заказа"), null);
  }

  var id = cdb.uuid.random();

  var fields = ["id", "vid", "userid", "uservid", "sum", "date"];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_ORDERS);

  var params = [id, options["vid"], options["userid"], options["uservid"], options["sum"], date];

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });



};
