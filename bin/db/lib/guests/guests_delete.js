const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');

/*
 Удалить всех гостей игрока: ИД
 - Проверка на ИД
 - Удаляем всех гостей этого пользователя
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  
  const DBF = DB_CONST.USER_GUESTS.fields;
  const DBN = DB_CONST.USER_GUESTS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"));
  }

  let condFieldsArr = [DBF.USERID_uuid_p];
  let condValuesArr = [1];
  

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBN, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query, [uid], {prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }

    callback(null, uid);
  });
};