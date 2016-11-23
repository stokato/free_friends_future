var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USERS.fields;

/*
 Удаляем пользователя: ИД
 - Проверка на ИД
 - Возвращаем ИД
 */
module.exports = function(id, callback) {
  if (!id) { callback(new Error("Задан пустой Id")); }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbConst.DB.USERS.name, [DBF.ID_uuid_p], [1]);

  cdb.client.execute(query, [id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};