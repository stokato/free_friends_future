/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 *
 * Отбираем сведения о новых друзьях из базы
 * И удаляем их
 *
 * @param String uid - ид пользователя, func callback
 * @return String uid - ид пользователя
 */

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBFN    = dbConst.USER_NEW_FRIENDS.fields;

module.exports = function(uid, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id пользователя")); }
  
  // Отбираем всех новых друзей
  let fields      = [DBFN.FRIENDID_uuid_pc2];
  let dbName      = dbConst.USER_NEW_FRIENDS.name;
  let constFields = [DBFN.USERID_uuid_pc1i];
  let constValues = [1];
  
  let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }
    
    // Удаляем их
    let params      = [uid];
    let constFields = [DBFN.USERID_uuid_pc1i, DBFN.FRIENDID_uuid_pc2];
    let constValues = [ 1, result.rows.length ];
    
    for (let i = 0; i < result.rows.length; i ++) {
      params.push(result.rows[i][DBFN.FRIENDID_uuid_pc2].toString());
    }
    
    let query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], dbName, constFields, constValues);
    cdb.client.execute(query, params, { prepare: true }, function(err) {
      if (err) { return callback(err); }
      
      callback(null, uid);
    });
  });
};