/*
 Удаляем пользователя: ИД
 - Проверка на ИД
 - Возвращаем ИД
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');

module.exports = function(id, callback) {
  
  const DBF = DB_CONST.USERS.fields;
  const DBN = DB_CONST.USERS.name;
  
  if (!id) {
    callback(new Error("Задан пустой Id"));
  }
  
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [1];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query, [id], { prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }

    callback(null, id);
  });
};