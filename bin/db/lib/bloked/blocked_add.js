/**
 * Created by Durov on 14.12.2016.
 *
 * Добавляем пользователя в черный список
 */

var async = require('async');

var cdb     = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF     = dbConst.DB.BLOCKED.fields;
var PF      = dbConst.PFIELDS;


module.exports = function (uid, options, callback) { options = options || {};

  if ( !uid || !options[PF.ID] || !options[PF.VID]  || !options[PF.DATE]) {
    return callback(new Error("Не указан Id пользователя, или данные блокируемого пользователя"), null);
  }

  var fields = [
    DBF.USERID_uuid_p,
    DBF.BLOCKEDID_uuid_ci,
    DBF.BLOCKEDVID_varchar,
    DBF.DATE_timestamp
  ];

  var params = [
    uid,
    options[PF.ID],
    options[PF.VID],
    options[PF.DATE]
  ];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.BLOCKED.name);

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, null);
  });
};