var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_GUESTS.fields;

/*
 Удалить всех гостей игрока: ИД
 - Проверка на ИД
 - Удаляем всех гостей этого пользователя
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  //var query = "DELETE FROM user_guests where user = ?";
  var constFields = [DBF.USERID_uuid_p];
  var constValues = [1];
  var dbName = dbConst.DB.USER_GUESTS.name;

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);

  cdb.client.execute(query, [uid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });
};