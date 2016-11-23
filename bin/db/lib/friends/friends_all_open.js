/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 */

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_NEW_FRIENDS.fields;

/*
 Снимаем поментку Новый со всех друзей пользователя
 */
module.exports = function(uid, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }
  
  // Отбираем всех новых друзей
  var fields = [DBF.FRIENDID_uuid_pc2];
  var constFields = [DBF.USERID_uuid_pc1i];
  var dbName = dbConst.DB.USER_NEW_FRIENDS.name;
  
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, [1]);
  
  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    // Удаляем их
    var params = [uid];
    var constFields = [
      DBF.USERID_uuid_pc1i,
      DBF.FRIENDID_uuid_pc2
    ];
    var constValues = [ 1, result.rows.length ];
    
    for (var i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i][DBF.FRIENDID_uuid_pc2]);
    }
    
    var dbName = dbConst.DB.USER_NEW_FRIENDS.name;
    
    var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
    cdb.client.execute(query, [params], { prepare: true }, function(err) {
      if (err) { return callback(err); }
      
      callback(null, uid);
    });
  });
};