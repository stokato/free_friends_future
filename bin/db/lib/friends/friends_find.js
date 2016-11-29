/**
 * Получаем список ид новых друзей
 * Получаем всех друзей
 * Указываем, какие их них новые (is_new)
 *
 * @param Strint uid - ид пользвателя, array friendsID - массив ид друзей (если нужны не все),
 *  bool withnew - нужна ли информация по новым друзьям, func callback
 *
 *  @return Object - объект с массивом друзей и количеством новых
 */

var async = require('async');

var cdb       = require('./../common/cassandra_db');
var dbConst   = require('./../../constants');
var DBFN      = dbConst.DB.USER_NEW_FRIENDS.fields;
var DBF       = dbConst.DB.USER_FRIENDS.fields;
var PF        = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

module.exports = function(uid, friendsID, withnew, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id"), null); }
  
  async.waterfall([ //--------------------------------------------------------
      function (cb) {
        if(withnew) {
          var fields      = [DBFN.FRIENDID_uuid_pc2];
          var dbName      = dbConst.DB.USER_NEW_FRIENDS.name;
          var constFields = [DBFN.USERID_uuid_pc1i];
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
          DBF.FRIENDBDATE_timestamp
        ];
        
        var constFields = [DBF.USERID_uuid_pi];
        var constCount  = [1];
        var dbName      = dbConst.DB.USER_FRIENDS.name;
        var params      = [uid];
  
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
              user[PF.ID]   = row[DBF.FRIENDID_uuid_c].toString();
              user[PF.VID]  = row[DBF.FRIENDVID_varhcar];
              user[PF.AGE]  = bdayToAge(row[DBF.FRIENDBDATE_timestamp]);
              user[PF.SEX]  = row[DBF.FRIENDSEX_int];
              
              if(withnew) {
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