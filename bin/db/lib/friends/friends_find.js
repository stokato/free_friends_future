var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBFN = dbConst.DB.USER_NEW_FRIENDS.fields;
var DBF = dbConst.DB.USER_FRIENDS.fields;
var PF = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

/*
 Найти друзей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектов с данными друзей (если ничгео нет - NULL)
 */
module.exports = function(uid, friendsID, isSelf, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id"), null); }
  
  async.waterfall([ //--------------------------------------------------------
      function (cb) {
        if(isSelf) {
          var fields = [DBFN.FRIENDID_uuid_c];
          var dbName = dbConst.DB.USER_NEW_FRIENDS.name;
          var constFields = [DBFN.USERID_uuid_pi];
          var constValues = [1];
          
          var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
          cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
            if (err) { return cb(err, null); }
    
            var newIds = [];
    
            for(var i = 0; i < result.rows.length; i++) {
              newIds.push(result.rows[i][DBFN.FRIENDID_uuid_c]);
            }
    
            cb(null, newIds);
          });
        } else { cb(null, [])}
      }, //-----------------------------------------------------------------
      function (newIds, cb) {
        var fields = [
          DBF.FRIENDID_uuid_c,
          DBF.FRIENDVID_varhcar,
          DBF.DATE_timestamp,
          DBF.FRIENDSEX_int,
          DBF.FRIENDBDAY_timestamp
        ];
        var constFields = [DBF.USERID_uuid_pi];
        var constCount = [1];
        var dbName = dbConst.DB.USER_FRIENDS.name;
        var params = [uid];
  
        if(friendsID) {
          constFields.push(DBF.FRIENDID_uuid_c);
          constCount.push(friendsID.length);
    
          for(var i = 0; i < friendsID.length; i++) {
            params.push(friendsID[i]);
          }
        }
          
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constCount);
  
        // Отбираем всех друзей или по списку friendsID
        cdb.client.execute(query, params, {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
          
          var user, users = [];
    
     
      
            for(var i = 0; i < result.rows.length; i++) {
              var row = result.rows[i];
        
              user = {};
              user[PF.ID] = row[DBF.FRIENDID_uuid_c].toString();
              user[PF.VID] = row[DBF.FRIENDVID_varhcar];
              user[PF.AGE] = bdayToAge(row[DBF.FRIENDBDAY_timestamp]);
              user[PF.SEX] = row[DBF.FRIENDSEX_int];
              
              if(isSelf) {
                user[PF.ISNEW] = false;
  
                for(var nid = 0; nid < newIds.length; nid++) {
                  if(user[PF.ID] == newIds[nid]) {
                    user[PF.ISNEW] = true;
                  }
                }
              }
              
              users.push(user);
            }
  
            cb(null, { friends : users, new_friends : newIds.length });
          
        });
      }
    ], //--------------------------------------------------------------------
    function (err, friends) {
      if(err) { return callback(err, null); }
      
      callback(null, friends);
    });
  
};