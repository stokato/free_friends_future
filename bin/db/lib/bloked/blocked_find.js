/**
 * Created by Durov on 14.12.2016.
 *
 * Получаем список блокированных пользователей для данного
 */

var cdb       = require('./../common/cassandra_db');
var dbConst   = require('./../../constants');
var DBF       = dbConst.DB.BLOCKED.fields;
var PF        = dbConst.PFIELDS;

module.exports = function(uid, callback) {
  if (!uid) {
    return callback(new Error("Задан пустой Id"), null);
  }

  var fields = [
    DBF.BLOCKEDID_uuid_ci,
    DBF.BLOCKEDVID_varchar,
    DBF.DATE_timestamp
  ];

  var constFields = [DBF.USERID_uuid_p];
  var constCount = [1];
  var dbName = dbConst.DB.BLOCKED.name;
  var params = [uid];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constCount);

  // Отбираем всех заблокированных
  cdb.client.execute(query, params, {prepare: true}, function (err, result) {
    if (err) {
      return callback(err, null);
    }

    var user, users = [];

    for (var i = 0; i < result.rows.length; i++) {
      var row = result.rows[i];

      user = {};
      user[PF.ID] = row[DBF.BLOCKEDID_uuid_ci].toString();
      user[PF.VID] = row[DBF.BLOCKEDVID_varchar];
      user[PF.DATE] = row[DBF.DATE_timestamp];
      users.push(user);
    }

    callback(null, users);
  })

};