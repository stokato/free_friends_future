var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.SHOP.fields;

/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(goodid, callback) {
  if (!goodid) { return callback(new Error("Задан пустой Id товара")); }

  var constFields = [DBF.ID_varchar_p];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbConst.DB.SHOP.name, constFields, constValues);

  cdb.client.execute(query, [goodid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, goodid);
  });
};