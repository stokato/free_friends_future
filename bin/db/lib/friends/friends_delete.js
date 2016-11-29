/**
 * Удаляем запись о друге из базы
 *
 * @param String uid - ид пользователя, String fid - ид друга, callback
 * @return uid - ид пользователя
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_FRIENDS.fields;

module.exports = function(uid, fid, callback) {
  if (!uid) { callback(new Error("Задан пустой Id пользователя")); }

  var fields        = [DBF.USERID_uuid_pi];
  var constValues   = [1];
  var params        = [uid];

  if(fid) {
    fields.push([DBF.FRIENDID_uuid_c]);
    constValues.push(1);
    params.push(fid);
  }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbConst.DB.USER_FRIENDS.name, fields, constValues);
  
  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, uid);
  });

};