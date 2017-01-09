/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 */
const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.DB.USER_GIFTS.fields;

/*
 Снимаем поментку Новый со всех подарков пользователя
 */
module.exports = function(uid, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }
  
  let fields = [DBF.ID_uuid_p];
  let constFields = [DBF.USERID_uuid_i];
  let constValues = [1];
  let dbName = dbConst.DB.USER_NEW_GIFTS.name;
  
  // Отбираем все новые подарки пользователя
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    // Меняем флаг нового сообщения
    
    let params = [];
    let constFields = [DBF.ID_uuid_p];
    let constValues = [result.rows.length];
    
    for (let i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i][DBF.ID_uuid_p].toString());
    }
    
    let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
    cdb.client.execute(query, params, { prepare: true }, function(err) {
      if (err) {  return callback(err); }
      
      callback(null, uid);
    });
  });
};