const async = require('async');

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF       = require('./../../../const_fields');

const bdayToAge = require('./../common/bdayToAge');

/*
 Найти все подарки игрока: ИД игрока
 - Проверка на ИД
 - Строим и выполняем запрос (все поля)
 - Возвращаем массив с подарками (если ничего нет NULL)
 */
module.exports = function(uid, isSelf, callback) {
  
  const DBF  = DB_CONST.USER_GIFTS.fields;
  const DBN  = DB_CONST.USER_GIFTS.name;
  
  const DBFN = DB_CONST.USER_NEW_GIFTS.fields;
  const DBNN = DB_CONST.USER_NEW_GIFTS.name;
  
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }

  async.waterfall([ // Отбираем сведения по новым подаркам
    function (cb) {
      if(isSelf) {
        let fieldsArr = [DBFN.ID_uuid_p];
        
        let condFieldsArr = [DBFN.USERID_uuid_i];
        let constFieldsArr = [1];
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBNN, condFieldsArr, constFieldsArr);
  
        dbCtrlr.client.execute(query,[uid], { prepare: true }, (err, result) => {
          if (err) {
            return cb(err, null);
          }
    
          let newIDArr = [];
    
          let rowsLen = result.rows.length;
          for(let i = 0; i < rowsLen; i++) {
            newIDArr.push(result.rows[i][DBFN.ID_uuid_p]);
          }
    
          cb(null, newIDArr);
        });
      } else { cb(null, []); }
      
    }, //-------------------------------------------------------------------------------
    function (newIDArr, cb) {
      let fieldsArr = [
        DBF.ID_uuid_p,
        DBF.GIFTID_varchar,
        DBF.TYPE_varchar,
        DBF.SRC_varhar,
        DBF.DATE_timestamp,
        DBF.TITLE_varchar,
        DBF.FROMID_uuid,
        DBF.FROMVID_varchar,
        DBF.FROMSEX_int,
        DBF.FROMBDATE_timestamp
      ];
      
      let condFieldsArr = [DBF.USERID_uuid_i];
      let condValuesArr = [1];
  
      // Отбираем все подарки пользователя
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
      dbCtrlr.client.execute(query,[uid], {prepare: true }, function(err, result) {
        if (err) {
          return cb(err, null);
        }
  
        let usersObj = {};
        let usersArr = [];
        let userObj;
        let giftObj;
        let rowObj;
        
        let rowsLen = result.rows.length;
        for(let i = 0; i < rowsLen; i++) {
          rowObj = result.rows[i];
          
          giftObj = {
            [PF.ID]     : rowObj[DBF.ID_uuid_p].toString(),
            [PF.GIFTID] : rowObj[DBF.GIFTID_varchar],
            [PF.FID]    : rowObj[DBF.FROMID_uuid].toString(),
            [PF.FVID]   : rowObj[DBF.FROMVID_varchar],
            [PF.TYPE]   : rowObj[DBF.TYPE_varchar],
            [PF.SRC]    : rowObj[DBF.SRC_varhar],
            [PF.DATE]   : rowObj[DBF.DATE_timestamp],
            [PF.TITLE]  : rowObj[DBF.TITLE_varchar]
          };
  
          if(isSelf) {
            giftObj[PF.ISNEW]   = false;
    
            let newIDLen = newIDArr.length;
            for(let nid = 0; nid < newIDLen; nid++) {
              if(giftObj[PF.ID] == newIDArr[nid]) {
                giftObj[PF.ISNEW] = true;
              }
            }
          }
          
          if(!usersObj[giftObj[PF.FID]]) {
            
            let age = bdayToAge(rowObj[DBF.FROMBDATE_timestamp]);
            
            userObj = {
              [PF.ID]     : giftObj[PF.FID],
              [PF.VID]    : giftObj[PF.FVID],
              [PF.AGE]    : age,
              [PF.SEX]    : rowObj[DBF.FROMSEX_int],
              [PF.GIFTS]  : []
            };
            
            usersObj[userObj[PF.ID]] = userObj;
          }
  
          usersObj[userObj[PF.ID]][PF.GIFTS].push(giftObj);
        }
        
        for(let item in usersObj) if(usersObj.hasOwnProperty(item)) {
          usersArr.push(usersObj[item]);
        }
  
        let res = {
          gifts     : usersArr,
          new_gifts : newIDArr.length
        };
                
        cb(null, res);
        
      });
    }], //-----------------------------------------------------------------------
  function (err, res) {
    if(err) {
      return callback(err, null);
    }
    
    callback(null, res);
  });
  
};