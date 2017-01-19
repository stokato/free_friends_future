/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 *
 * Отбираем сведения о новых друзьях из базы
 * И удаляем их
 *
 * @param String uid - ид пользователя, func callback
 * @return String uid - ид пользователя
 */

const async = require('async');

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

module.exports = function(uid, callback) {
  
  const DBFN    = DB_CONST.USER_NEW_FRIENDS.fields;
  const DBNN    = DB_CONST.USER_NEW_FRIENDS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"));
  }
  
  async.waterfall([
    // Отбираем всех новых друзей
    function (cb) {
  
      let fieldsArr      = [DBFN.FRIENDID_uuid_pc2];
      let condFieldsArr = [DBFN.USERID_uuid_pc1i];
      let condValuesArr = [1];
      let paramsArr     = [uid];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBNN, condFieldsArr, condValuesArr);
  
      
      dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err, result) => {
        if (err) {
          return cb(err, null);
        }
    
        cb(null, result);
      });
    },
    // Удаляем их
    function (result, cb) {
      let condFieldsArr = [DBFN.USERID_uuid_pc1i, DBFN.FRIENDID_uuid_pc2];
      let condValuesArr = [ 1, result.rows.length ];
      let paramsArr     = [uid];
      
      let rowsLen = result.rows.length;
      for (let i = 0; i < rowsLen; i ++) {
        paramsArr.push(result.rows[i][DBFN.FRIENDID_uuid_pc2].toString());
      }
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBNN, condFieldsArr, condValuesArr);
      
      dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }
    
        cb(null, uid);
      });
    }
  ], function (err, uid) {
    if(err) {
      callback(err, null);
    }
    
    callback(null, uid);
  });

};