/**
 * Created by s.t.o.k.a.t.o on 18.11.2016.
 */
const async = require('async');

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');

/*
 Снимаем поментку Новый со всех гостей пользователя
 */
module.exports = function(uid, callback) {
  
  const DBFN = DB_CONST.USER_NEW_GUESTS.fields;
  const DBNN = DB_CONST.USER_NEW_GUESTS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"));
  }
  
  async.waterfall([
    // Отбираем всех новых друзей
    function (cb) {
      let fieldsArr = [DBFN.GUESTID_uuid_pc2i];
  
      let condFieldsArr = [DBFN.USERID_uuid_pc1i];
      let condValuesArr = [1];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBNN, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query,[uid], {prepare: true }, (err, result) => {
        if (err) {
          return cb(err, null);
        }
    
        cb(null, result)
      });
    },
    // Удаляем их
    function (result, cb) {
      let paramsArr = [uid];
      let condFieldsArr = [DBFN.USERID_uuid_pc1i, DBFN.GUESTID_uuid_pc2i];
      let condValuesArr = [ 1, result.rows.length ];
  
      let rowsLen = result.rows.length;
      for (let i = 0; i < rowsLen; i ++) {
        paramsArr.push(result.rows[i][DBFN.GUESTID_uuid_pc2i]);
      }
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_DELETE, [], DBNN, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }
    
        cb(null, uid);
      });
    }
  ], function (err, res) {
    if(err) {
      callback(err, null);
    }
    
    callback(null, res);
  });
  
};