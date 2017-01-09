/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 */
const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const DBFN    = dbConst.DB.USER_NEW_GUESTS.fields;

/*
 Снимаем поментку Новый со всех гостей пользователя
 */
module.exports = function(uid, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }
  
  // Отбираем всех новых друзей
  let fields = [DBFN.GUESTID_uuid_pc2i];
  let dbName = dbConst.DB.USER_NEW_GUESTS.name;
  let constFields = [DBFN.USERID_uuid_pc1i];
  let constValues = [1];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    // Удаляем их
    let params = [uid];
    let constFields = [DBFN.USERID_uuid_pc1i, DBFN.GUESTID_uuid_pc2i];
    let constValues = [ 1, result.rows.length ];
    
    for (let i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i][DBFN.GUESTID_uuid_pc2i]);
    }
    
    let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
    cdb.client.execute(query, params, { prepare: true }, function(err) {
      if (err) { return callback(err); }
      
      callback(null, uid);
    });
  });
};