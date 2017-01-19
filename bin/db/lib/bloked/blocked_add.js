/**
 * Created by Durov on 14.12.2016.
 *
 * Добавляем пользователя в черный список
 */

const async = require('async');

const dbCtrlr = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF      = require('./../../../const_fields');

module.exports = function (uid, options, callback) { options = options || {};
  
  const DBF     = DB_CONST.BLOCKED.fields;
  const DBNAME  =  DB_CONST.BLOCKED.name;
  
  if ( !uid || !options[PF.ID] || !options[PF.VID]  || !options[PF.DATE]) {
    return callback(new Error("Не указан Id пользователя, или данные блокируемого пользователя"), null);
  }

  let fieldsArr = [
    DBF.USERID_uuid_p,
    DBF.BLOCKEDID_uuid_ci,
    DBF.BLOCKEDVID_varchar,
    DBF.DATE_timestamp
  ];

  let paramsArr = [
    uid,
    options[PF.ID],
    options[PF.VID],
    options[PF.DATE]
  ];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBNAME);

  dbCtrlr.client.execute(query, paramsArr, {prepare: true },  function(err) {
    if (err) {
      return callback(err);
    }

    callback(null, null);
  });
};