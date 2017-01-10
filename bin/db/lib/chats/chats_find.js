/**
 *   Получаем индексы чатов с новыми сообщениями,
 *   Получаем все чаты пользоателя
 *   Указываем какие из них с новыми сообщениями - is_new
 *
 *   @param String uid - ид пользователя, func callback
 *   @return Object - массив с чатами и количество новых
 */

const async = require('async');

const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');
const bdayToAge = require('./../common/bdayToAge');
const constants = require('./../../../constants');

const DBF   = dbConst.USER_CHATS.fields;
const DBFN  = dbConst.USER_NEW_CHATS.fields;
const PF    = constants.PFIELDS;


module.exports = function(uid, callback) {
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  
  async.waterfall([ //-----------------------------------------------------------------
    function (cb) {
      let params = [uid];
      let fields = [DBFN.COMPANIONID_uuid_pc2];
      
      let constFields = [DBFN.USERID_uuid_pc1i];
      let constValues = [1];
      let dbName = dbConst.USER_NEW_CHATS.name;
      
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
      
      cdb.client.execute(query, params, {prepare : true}, function (err, result) {
        if(err) { return cb(err, null); }
        
        let newIds = [];
        
        for(let i = 0; i < result.rows.length; i++) {
          newIds.push(result.rows[i][DBFN.COMPANIONID_uuid_pc2]);
        }
        
        cb(null, newIds);
      })
    }, //-----------------------------------------------------------------
    function (newIds, cb) {
      let params = [uid];
  
      let fields = [
        DBF.COMPANIONID_uuid_c,
        DBF.ISNEW_boolean,
        DBF.COMPANIONBDATE_timestamp,
        DBF.COMPANIONSEX_int,
        DBF.COMPANIONVID_varchar
      ];
  
      let const_fields = [DBF.USERID_uuid_p];
      let const_values = [1];
      let dbName        = dbConst.USER_CHATS.name;
  
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, const_fields, const_values);
  
      cdb.client.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }
    
        let row, user, users = [];
    
        for (let i = 0; i < result.rows.length; i++) {
          row = result.rows[i];
      
          user = {
            [PF.ID]  : row[DBF.COMPANIONID_uuid_c].toString(),
            [PF.VID] : row[DBF.COMPANIONVID_varchar],
            [PF.AGE] : bdayToAge(row[DBF.COMPANIONBDATE_timestamp]),
            [PF.SEX] : row[DBF.COMPANIONSEX_int]
          };
          
          user[PF.ISNEW]  = false;
      
          for (let n = 0; i < newIds.length; i++) {
            if(user[PF.ID] == newIds[n][PF.ID]) {
              user[PF.ISNEW] = true;
            }
          }
  
          users.push(user);
 
        }
    
        let res = {
          [PF.CHATS]     : users,
          [PF.NEWCHATS]  : newIds.length
        };
    
        cb(null, res);
      });
    }], //--------------------------------------------------------------------------
  function (err, chats) {
    if(err) { return callback(err); }
    
    callback(null, chats);
  });
    
};