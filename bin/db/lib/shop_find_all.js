var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(callback) {
  var f = C.IO.FIELDS;

  var fields = [f.id, f.title, f.type, f.price, f.data];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_SHOP);

  this.client.execute(query,[], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, null);

    var goods = [];

    var i;
    var rowsLen = result.rows.length;
    for (i = 0; i < rowsLen; i++) {
      var row = result.rows[i];

      var good = {};
      good[f.id]  = row[f.id].toString();
      good[f.title] = row[f.title];
      good[f.type]  = row[f.type];
      good[f.price] = row[f.price];
      good[f.data]  = row[f.data];

      goods.push(good);
    }
    callback(null, goods);
  });
};