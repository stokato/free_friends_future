/**
 *   Получаем индексы чатов с новыми сообщениями,
 *   Получаем все чаты пользоателя
 *   Указываем какие из них с новыми сообщениями - is_new
 *
 *   @param String uid - ид пользователя, func callback
 *   @return Object - массив с чатами и количество новых
 */

const async = require('async');

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');
const bdayToAge = require('./../common/bdayToAge');
const PF        = require('./../../../const_fields');

module.exports = function(uid, callback) {
  
  const DBF       = DB_CONST.USER_CHATS.fields;
  const DB_NAME   = DB_CONST.USER_CHATS.name;
  
  const DBFN      = DB_CONST.USER_NEW_CHATS.fields;
  const DB_NAME_N = DB_CONST.USER_NEW_CHATS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  
  async.waterfall([ //-----------------------------------------------------------------
    function (cb) {
      let paramsArr = [uid];
      let fieldsArr = [DBFN.COMPANIONID_uuid_pc2];
      
      let condFieldsArr = [DBFN.USERID_uuid_pc1i];
      let condValuesArr = [1];

      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DB_NAME_N, condFieldsArr, condValuesArr);
      
      dbCtrlr.client.execute(query, paramsArr, {prepare : true}, function (err, result) {
        if(err) {
          return cb(err, null);
        }
        
        let newIDArr = [];
        
        let rowsLen = result.rows.length;
        for(let i = 0; i < rowsLen; i++) {
          newIDArr.push(result.rows[i][DBFN.COMPANIONID_uuid_pc2]);
        }
        
        cb(null, newIDArr);
      })
    }, //-----------------------------------------------------------------
    function (newIDArr, cb) {
      let paramsArr = [uid];
  
      let fieldsArr = [
        DBF.COMPANIONID_uuid_c,
        DBF.ISNEW_boolean,
        DBF.COMPANIONBDATE_timestamp,
        DBF.COMPANIONSEX_int,
        DBF.COMPANIONVID_varchar
      ];
  
      let condFieldsArr = [DBF.USERID_uuid_p];
      let condValuesArr = [1];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DB_NAME, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query, paramsArr, {prepare: true}, function (err, result) {
        if (err) {
          return cb(err, null);
        }
    
        let rowObj;
        let userObj;
        let usersArr = [];
        let rowsLen = result.rows.length;
        let age;
        
        for (let i = 0; i < rowsLen; i++) {
          rowObj = result.rows[i];
      
          age = bdayToAge(rowObj[DBF.COMPANIONBDATE_timestamp]);
          
          userObj = {
            [PF.ID]  : rowObj[DBF.COMPANIONID_uuid_c].toString(),
            [PF.VID] : rowObj[DBF.COMPANIONVID_varchar],
            [PF.AGE] : age,
            [PF.SEX] : rowObj[DBF.COMPANIONSEX_int]
          };
          
          userObj[PF.ISNEW]  = false;
      
          let newIdsLen = newIDArr.length;
          for (let n = 0; i < newIdsLen; i++) {
            if(userObj[PF.ID] == newIDArr[n][PF.ID]) {
              userObj[PF.ISNEW] = true;
            }
          }
  
          usersArr.push(userObj);
        }
    
        let resObj = {
          [PF.CHATS]     : usersArr,
          [PF.NEWCHATS]  : newIDArr.length
        };
    
        cb(null, resObj);
      });
    }], //--------------------------------------------------------------------------
  function (err, chats) {
    if(err) {
      return callback(err);
    }
    
    callback(null, chats);
  });
    
};