const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

/*
 Удалить товар из БД: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на удаление товара
 - Возвращаем ИД товара
 */

module.exports = function(goodid, callback) {

  const DBF = DB_CONST.SHOP.fields;
  const DBN = DB_CONST.SHOP.name;
  
  if (!goodid) {
    return callback(new Error("Задан пустой Id товара"));
  }

  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [1];
  let paramsArr     = [goodid];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }

    callback(null, goodid);
  });
};