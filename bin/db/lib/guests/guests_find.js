const async = require('async');

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

const bdayToAge = require('./../common/bdayToAge');

/*
 Найти гостей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными (Если не нашли ничего - NULL)
 */
module.exports = function(uid, isSelf, callback) {
  
  const DBF  = DB_CONST.USER_GUESTS.fields;
  const DBN  = DB_CONST.USER_GUESTS.name;
  
  const DBFN = DB_CONST.USER_NEW_GUESTS.fields;
  const DBNN = DB_CONST.USER_NEW_GUESTS.name;
  
  if (!uid ) {
    return callback(new Error("Задан пустой Id"), null);
  }
  
  async.waterfall([ //---------------------------------------------------
      function (cb) {
        if(isSelf) {
          let fieldsArr = [DBFN.GUESTID_uuid_pc2i];
          
          let condFieldsArr = [DBFN.USERID_uuid_pc1i];
          let condValuesArr = [1];
          
          let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBNN, condFieldsArr, condValuesArr);
          
          dbCtrlr.client.execute(query,[uid], {prepare: true }, (err, result) => {
            if (err) {
              return cb(err, null);
            }
            
            let newIDArr = [];
            
            let rowsLen = result.rows.length;
            for(let i = 0; i < rowsLen; i++) {
              newIDArr.push(result.rows[i][DBFN.GUESTID_uuid_pc2i].toString());
            }
            
            cb(null, newIDArr);
          });
        } else { cb(null, []); }
        
      }, //---------------------------------------------------------------
      function (newIDArr, cb) {
        
        // Отбираем всех гостей
        let fieldsArr = [
          DBF.GUESTID_uuid_ci,
          DBF.GUESTVID_varchar,
          DBF.DATE_timestamp,
          DBF.GUESTBDATE_timestamp,
          DBF.GUESTSEX_int
        ];
        
        let condFieldsArr = [DBF.USERID_uuid_p];
        let condValuesArr = [1];
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);
        
        dbCtrlr.client.execute(query,[uid], {prepare: true }, (err, result) => {
          if (err) {
            return cb(err, null);
          }
          
          let guestsArr = [];
          
          let rowsLen = result.rows.length;
          for(let i = 0; i < rowsLen; i++) {
            let rowObj = result.rows[i];
            
            let age = bdayToAge(rowObj[DBF.GUESTBDATE_timestamp]);
            
            let guestObj = {
              [PF.ID]   : rowObj[DBF.GUESTID_uuid_ci].toString(),
              [PF.VID]  : rowObj[DBF.GUESTVID_varchar],
              [PF.DATE] : rowObj[DBF.DATE_timestamp],
              [PF.AGE]  : age,
              [PF.SEX]  : rowObj[DBF.GUESTSEX_int]
            };
            
            if(isSelf) {
              guestObj[PF.ISNEW] = false;
              
              let newIDLen = newIDArr.length;
              for(let nid = 0; nid < newIDLen; nid++) {
                
                if(guestObj[PF.ID] == newIDArr[nid]) {
                  guestObj[PF.ISNEW] = true;
                }
                
              }
            }
            
            guestsArr.push(guestObj);
          }
          
          let res = {
            guests : guestsArr,
            new_guests : newIDArr.length
          };
          
          cb(null, res);
        });
      }
    ], // -------------------------------------------------------------
    function (err, res) {
      if (err) {
        return callback(err, null);
      }
      
      callback(null, res);
    });
  
};