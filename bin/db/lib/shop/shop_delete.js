var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(goodid, callback) {
  if (!goodid) { return callback(new Error("Задан пустой Id товара")); }

  var constFields = ["id"];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_SHOP, constFields, constValues);

  cdb.client.execute(query, [goodid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, goodid);
  });
};