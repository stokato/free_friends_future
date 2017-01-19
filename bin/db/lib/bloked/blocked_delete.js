/**
 * Created by Durov on 14.12.2016.
 *
 * Удаляем пользователя из списка заблокированных
 */

const dbCtrlr = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

module.exports = function(uid, fid, callback) {
  
  const DBF    = DB_CONST.BLOCKED.fields;
  const DBNAME = DB_CONST.BLOCKED.name;
  
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  let condFieldsArr   = [DBF.USERID_uuid_p];
  let condValuesArr   = [1];
  let paramsArr        = [uid];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBNAME, condFieldsArr, condValuesArr);

  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });

};