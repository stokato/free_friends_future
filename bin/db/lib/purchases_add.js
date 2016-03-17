var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Добавляем заказ в БД
 */
module.exports = function(options, callback) { options   = options || {};
  var f = C.IO.FIELDS;

  if (!options[f.userid] || !options[f.goodid]) {
    return callback(new Error("Не задан один из параметров покупки"), null);
  }

  var id = this.uuid.random();

  var fields = [f.id, f.userid, f.goodid];
  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERGOODS);

  var params = [id, options[f.userid], options[f.goodid]];

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};
