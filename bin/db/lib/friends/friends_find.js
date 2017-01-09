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

const async = require('async');

const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');
const bdayToAge = require('./../common/bdayToAge');

const DBFN      = dbConst.DB.USER_NEW_FRIENDS.fields;
const DBF       = dbConst.DB.USER_FRIENDS.fields;
const PF        = dbConst.PFIELDS;

module.exports = function(uid, friendsID, withnew, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id"), null); }
  
  async.waterfall([ //--------------------------------------------------------
      function (cb) {
        if(withnew) {
          let fields      = [DBFN.FRIENDID_uuid_pc2];
          let dbName      = dbConst.DB.USER_NEW_FRIENDS.name;
          let constFields = [DBFN.USERID_uuid_pc1i];
          let constValues = [1];
          
          let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
  
          cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
            if (err) { return cb(err, null); }
    
            let newIds = [];
    
            for(let i = 0; i < result.rows.length; i++) {
              newIds.push(result.rows[i][DBFN.FRIENDID_uuid_c]);
            }
    
            cb(null, newIds);
          });
        } else { cb(null, [])}
      }, //-----------------------------------------------------------------
      function (newIds, cb) {
        
        let fields = [
          DBF.FRIENDID_uuid_c,
          DBF.FRIENDVID_varhcar,
          DBF.DATE_timestamp,
          DBF.FRIENDSEX_int,
          DBF.FRIENDBDATE_timestamp
        ];
        
        let constFields = [DBF.USERID_uuid_pi];
        let constCount  = [1];
        let dbName      = dbConst.DB.USER_FRIENDS.name;
        let params      = [uid];
  
        if(friendsID) {
          constFields.push(DBF.FRIENDID_uuid_c);
          constCount.push(friendsID.length);
    
          for(let i = 0; i < friendsID.length; i++) {
            params.push(friendsID[i]);
          }
        }
          
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constCount);
  
        // Отбираем всех друзей или по списку friendsID
        cdb.client.execute(query, params, {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
          
          let user, users = [];
          
            for(let i = 0; i < result.rows.length; i++) {
              let row = result.rows[i];
        
              user = {
                [PF.ID]   : row[DBF.FRIENDID_uuid_c].toString(),
                [PF.VID]  : row[DBF.FRIENDVID_varhcar],
                [PF.AGE]  : bdayToAge(row[DBF.FRIENDBDATE_timestamp]),
                [PF.SEX]  : row[DBF.FRIENDSEX_int]
              };
              
              if(withnew) {
                user[PF.ISNEW] = false;
  
                for(let nid = 0; nid < newIds.length; nid++) {
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