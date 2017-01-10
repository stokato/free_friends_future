/**
 * Created by Durov on 14.12.2016.
 *
 * Добавляем пользователя в черный список
 */

const async = require('async');

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF     = dbConst.BLOCKED.fields;
const PF      = constants.PFIELDS;


module.exports = function (uid, options, callback) { options = options || {};

  if ( !uid || !options[PF.ID] || !options[PF.VID]  || !options[PF.DATE]) {
    return callback(new Error("Не указан Id пользователя, или данные блокируемого пользователя"), null);
  }

  let fields = [
    DBF.USERID_uuid_p,
    DBF.BLOCKEDID_uuid_ci,
    DBF.BLOCKEDVID_varchar,
    DBF.DATE_timestamp
  ];

  let params = [
    uid,
    options[PF.ID],
    options[PF.VID],
    options[PF.DATE]
  ];

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.BLOCKED.name);

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, null);
  });
};