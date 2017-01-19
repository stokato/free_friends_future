/**
 * Created by Durov on 14.12.2016.
 *
 * Получаем список блокированных пользователей для данного
 */

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');
const PF        = require('./../../../const_fields');

module.exports = function(uid, callback) {
  
  const DBF       = DB_CONST.BLOCKED.fields;
  const DBNAME    = DB_CONST.BLOCKED.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id"), null);
  }

  let sFieldsArr = [
    DBF.BLOCKEDID_uuid_ci,
    DBF.BLOCKEDVID_varchar,
    DBF.DATE_timestamp
  ];

  let condFieldsArr = [DBF.USERID_uuid_p];
  let condValuesArr = [1];
  
  let paramsArr = [uid];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, sFieldsArr, DBNAME, condFieldsArr, condValuesArr);

  // Отбираем всех заблокированных
  dbCtrlr.client.execute(query, paramsArr, {prepare: true}, function (err, result) {
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