var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Удалить всех гостей игрока: ИД
 - Проверка на ИД
 - Удаляем всех гостей этого пользователя
 - Возвращаем ИД игрока
 */
module.exports = function(uid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  //var query = "DELETE FROM user_guests where user = ?";
  var constFields = ["userid"];
  var constValues = [1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_USERGUESTS, constFields, constValues);

  cdb.client.execute(query, [uid], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });
};