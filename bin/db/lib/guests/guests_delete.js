const cdb = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const DBF = dbConst.USER_GUESTS.fields;

/*
 Удалить всех гостей игрока: ИД
 - Проверка на ИД
 - Удаляем всех гостей этого пользователя
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  //let query = "DELETE FROM user_guests where user = ?";
  let constFields = [DBF.USERID_uuid_p];
  let constValues = [1];
  let dbName = dbConst.USER_GUESTS.name;

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);

  cdb.client.execute(query, [uid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });
};