var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
/*
 Удалить всех друзей игрока: ИД
 - Проверка на ИД
 - Строим и выполняем запрос на поиск всех друзей игрока (нужны их ИД для удаления)
 - По каждому найденному выполняем запрос на его удаление (параллельно)
 - Возвращаем ИД игрока
 */
module.exports = function(uid, fid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }


  var fields = ["userid"];
  var constValues = [1];
  var params = [uid];

  if(fid) {
    fields.push(["friendid"]);
    constValues.push(1);
    params.push(fid);
  }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_USERFRIENDS, fields, constValues);
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });

};