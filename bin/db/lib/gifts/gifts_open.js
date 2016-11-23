/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 */
var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_GIFTS.fields;

/*
 Снимаем поментку Новый со всех подарков пользователя
 */
module.exports = function(uid, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }
  
  var fields = [DBF.ID_uuid_p];
  var constFields = [DBF.USERID_uuid_i];
  var constValues = [1];
  var dbName = dbConst.DB.USER_NEW_GIFTS.name;
  
  // Отбираем все новые подарки пользователя
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    // Меняем флаг нового сообщения
    
    var params = [];
    var constFields = [DBF.ID_uuid_p];
    var constValues = [result.rows.length];
    
    for (var i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i][DBF.ID_uuid_p].toString());
    }
    
    var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
    cdb.client.execute(query, params, { prepare: true }, function(err) {
      if (err) {  return callback(err); }
      
      callback(null, uid);
    });
  });
};