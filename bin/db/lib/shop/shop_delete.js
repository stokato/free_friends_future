const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF     = dbConst.SHOP.fields;

/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(goodid, callback) {
  if (!goodid) { return callback(new Error("Задан пустой Id товара")); }

  let constFields = [DBF.ID_varchar_p];
  let constValues = [1];

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbConst.SHOP.name, constFields, constValues);

  cdb.client.execute(query, [goodid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, goodid);
  });
};