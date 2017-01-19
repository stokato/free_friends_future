const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const DBF     = DB_CONST.USERS.fields;

/*
 Удаляем пользователя: ИД
 - Проверка на ИД
 - Возвращаем ИД
 */
module.exports = function(id, callback) {
  if (!id) { callback(new Error("Задан пустой Id")); }

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DB_CONST.USERS.name, [DBF.ID_uuid_p], [1]);

  dbCtrlr.client.execute(query, [id], {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, id);
  });
};