var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBC = dbConst.DB.USER_CHATS;
var DBF = DBC.fields;
var DBFN = dbConst.DB.USER_NEW_CHATS.fields;
var PF = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

/*
 Найти пользователей, с которыми были чаты, показать наличине новых сообщений
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с пользователями (если ничего нет null)
 */

module.exports = function(uid, callback) {
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  
  async.waterfall([
    function (cb) {
      var params = [uid];
      var fields = [DBFN.COMPANIONID_uuid_pc2];
      
      var constFields = [DBFN.USERID_uuid_pc1i];
      var constValues = [1];
      var dbName = dbConst.DB.USER_NEW_CHATS.name;
      
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
      
      cdb.client.execute(query, params, {prepare : true}, function (err, result) {
        if(err) { return cb(err, null); }
        
        var newIds = [];
        
        for(var i = 0; i < result.rows.length; i++) {
          newIds.push(result.rows[i][DBFN.COMPANIONID_uuid_pc2]);
        }
        
        cb(null, newIds);
      })
    },
    function (newIds, cb) {
      var params = [uid];
  
      var fields = [
        DBF.COMPANIONID_uuid_c,
        DBF.ISNEW_boolean,
        DBF.COMPANIONBDATE_timestamp,
        DBF.COMPANIONSEX_int,
        DBF.COMPANIONVID_varchar
      ];
  
      var const_fields = [DBF.USERID_uuid_p];
      var const_values = [1];
  
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, DBC.name, const_fields, const_values);
  
      cdb.client.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }
    
        var row, user, users = [];
    
        for (var i = 0; i < result.rows.length; i++) {
          row = result.rows[i];
      
          user = {};
          user[PF.ID]     = row[DBF.COMPANIONID_uuid_c].toString();
          user[PF.VID]    = row[DBF.COMPANIONVID_varchar];
          user[PF.AGE]    = bdayToAge(row[DBF.COMPANIONBDATE_timestamp]);
          user[PF.SEX]    = row[DBF.COMPANIONSEX_int];
          
          user[PF.ISNEW]  = false;
      
          users.push(user);
      
          for (var n = 0; i < newIds.length; i++) {
            if(user[PF.ID] == newIds[n][PF.ID]) {
              user[PF.ISNEW] = true;
            }
          }
          
          // if(user[PF.ISNEW] == true) {
          //   countNew++;
          // }
        }
    
        var res = {};
        res[PF.CHATS] = users;
        res[PF.NEWCHATS] = newIds.length;
    
        cb(null, res);
      });
    }
  ], //--------------------------------------------------------------------------
  function (err, chats) {
    if(err) { return callback(err); }
    
    callback(null, chats);
  });
  
  
};