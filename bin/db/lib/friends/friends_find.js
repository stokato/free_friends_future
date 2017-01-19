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

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');
const bdayToAge = require('./../common/bdayToAge');

module.exports = function(uid, friendsID, isWithNew, callback) {
  
  const DBFN      = DB_CONST.USER_NEW_FRIENDS.fields;
  const DBNN      = DB_CONST.USER_NEW_FRIENDS.name;
  
  const DBF       = DB_CONST.USER_FRIENDS.fields;
  const DBN       = DB_CONST.USER_FRIENDS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id"), null);
  }
  
  async.waterfall([ //--------------------------------------------------------
      // Получаем новых друзей
      function (cb) {
        if(isWithNew) {
          let fieldsArr      = [DBFN.FRIENDID_uuid_pc2];
          let condFieldsArr  = [DBFN.USERID_uuid_pc1i];
          let condValuesArr  = [1];
          let paramsArr      = [uid];
          
          let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBNN, condFieldsArr, condValuesArr);
          
          dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err, result) => {
            if (err) {
              return cb(err, null);
            }
            
            let newIDArr = [];
            
            let rowsLen = result.rows.length;
            for(let i = 0; i < rowsLen; i++) {
              newIDArr.push(result.rows[i][DBFN.FRIENDID_uuid_c]);
            }
            
            cb(null, newIDArr);
          });
        } else { cb(null, [])}
      }, //-----------------------------------------------------------------
      // Получаем всех остальных друзей
      function (newIDArr, cb) {
        
        let fieldsArr = [
          DBF.FRIENDID_uuid_c,
          DBF.FRIENDVID_varhcar,
          DBF.DATE_timestamp,
          DBF.FRIENDSEX_int,
          DBF.FRIENDBDATE_timestamp
        ];
        
        let condFieldsArr = [DBF.USERID_uuid_pi];
        let condValuesArr = [1];
        let paramsArr     = [uid];
        
        // Если нужно отобрать определенный друзей, включаем их ИД в услвоие
        if(friendsID) {
          condFieldsArr.push(DBF.FRIENDID_uuid_c);
          condValuesArr.push(friendsID.length);
          
          let friendsCount = friendsID.length;
          for(let i = 0; i < friendsCount; i++) {
            paramsArr.push(friendsID[i]);
          }
        }
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);
        
        // Отбираем всех друзей или по списку friendsID
        dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err, result) => {
          if (err) {
            return cb(err, null);
          }
          
          let userObj;
          let usersArr = [];
          let rowObj;
          let age;
          
          let rowsLen = result.rows.length;
          for(let i = 0; i < rowsLen; i++) {
            rowObj = result.rows[i];
            
            age = bdayToAge(rowObj[DBF.FRIENDBDATE_timestamp]);
            
            userObj = {
              [PF.ID]   : rowObj[DBF.FRIENDID_uuid_c].toString(),
              [PF.VID]  : rowObj[DBF.FRIENDVID_varhcar],
              [PF.AGE]  : age,
              [PF.SEX]  : rowObj[DBF.FRIENDSEX_int]
            };
            
            if(isWithNew) {
              userObj[PF.ISNEW] = false;
              
              let newIDLen = newIDArr.length;
              for(let nid = 0; nid < newIDLen; nid++) {
                if(userObj[PF.ID] == newIDArr[nid]) {
                  userObj[PF.ISNEW] = true;
                }
              }
            }
            
            usersArr.push(userObj);
          }
          
          let res = {
            friends     : usersArr,
            new_friends : newIDArr.length
          };
          
          cb( null, res );
        });
      }
    ], //--------------------------------------------------------------------
    function (err, friends) {
      if(err) {
        return callback(err, null);
      }
      
      callback(null, friends);
    });
  
};