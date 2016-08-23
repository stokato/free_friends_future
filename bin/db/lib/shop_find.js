var constants = require('../../constants');
var cdb = require('./../../cassandra_db');

/*
 Найти все товары: ИД
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными (Если не нашли ничего - NULL)
 */
module.exports = function(goodid, callback) {
  if(!goodid) { return callback(new Error("Не задан ИД товара"), null); }

  var fields = ["title", "type", "price", "src", "goodtype", "price2"];
  var constFields = ["id"];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_SHOP, constFields, constValues);

  cdb.client.execute(query,[goodid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(null, null); }

    var good = result.rows[0];
    good.id = goodid;

    callback(null, good);
  });
};