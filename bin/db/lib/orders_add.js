var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) { options   = options || {};
  var f = C.IO.FIELDS;

  var date    = options[f.date] || new Date;

  if (!options[f.vid] || !options[f.userid] || !options[f.uservid] || !options[f.sum]) {
    return callback(new Error("Не задан один из параметров заказа"), null);
  }

  var id = this.uuid.random();

  var fields = [f.id, f.vid, f.userid, f.uservid, f.sum, f.date];
  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_ORDERS);

  var params = [id, options[f.vid], options[f.userid], options[f.uservid], options[f.sum], date];

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};
