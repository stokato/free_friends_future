/**
 * Created by Durov on 14.12.2016.
 *
 * Получаем список блокированных пользователей для данного
 */

const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');
const constants = require('./../../../constants');

const DBF       = dbConst.BLOCKED.fields;
const PF        = constants.PFIELDS;

module.exports = function(uid, callback) {
  if (!uid) {
    return callback(new Error("Задан пустой Id"), null);
  }

  let fields = [
    DBF.BLOCKEDID_uuid_ci,
    DBF.BLOCKEDVID_varchar,
    DBF.DATE_timestamp
  ];

  let constFields = [DBF.USERID_uuid_p];
  let constCount = [1];
  let dbName = dbConst.BLOCKED.name;
  let params = [uid];

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constCount);

  // Отбираем всех заблокированных
  cdb.client.execute(query, params, {prepare: true}, function (err, result) {
    if (err) {
      return callback(err, null);
    }

    let user, users = [];

    for (let i = 0; i < result.rows.length; i++) {
      let row = result.rows[i];

      user = {
        [PF.ID]   : row[DBF.BLOCKEDID_uuid_ci].toString(),
        [PF.VID]  : row[DBF.BLOCKEDVID_varchar],
        [PF.DATE] : row[DBF.DATE_timestamp]
      };
      
      users.push(user);
    }

    callback(null, users);
  })

};