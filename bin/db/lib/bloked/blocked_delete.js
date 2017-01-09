/**
 * Created by Durov on 14.12.2016.
 *
 * Удаляем пользователя из списка заблокированных
 */

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.DB.BLOCKED.fields;

module.exports = function(uid, fid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  let constFields   = [DBF.USERID_uuid_p];
  let constValues   = [1];
  let params        = [uid];

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbConst.DB.BLOCKED.name, constFields, constValues);

  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });

};