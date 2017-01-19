const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

const DBF     = DB_CONST.SHOP.fields;

/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */
module.exports = function(goodid, callback) {
  if (!goodid) { return callback(new Error("Задан пустой Id товара")); }

  let constFields = [DBF.ID_uuid_p];
  let constValues = [1];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DB_CONST.SHOP.name, constFields, constValues);

  dbCtrlr.client.execute(query, [goodid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, goodid);
  });
};