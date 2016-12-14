/**
 * Created by Durov on 14.12.2016.
 *
 * Удаляем пользователя из списка заблокированных
 */


var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.BLOCKED.fields;

module.exports = function(uid, fid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  var constFields   = [DBF.USERID_uuid_p];
  var constValues   = [1];
  var params        = [uid];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbConst.DB.BLOCKED.name, constFields, constValues);

  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });

};