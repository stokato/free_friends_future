const async = require('async');

const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');
const bdayToAge = require('./../common/bdayToAge');
const constants = require('./../../../constants');

const DBF   = dbConst.USER_GUESTS.fields;
const DBFN  = dbConst.USER_NEW_GUESTS.fields;
const PF    = constants.PFIELDS;


/*
 Найти гостей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными (Если не нашли ничего - NULL)
 */
module.exports = function(uid, isSelf, callback) {
  
  if (!uid ) { return callback(new Error("Задан пустой Id"), null); }
  
  async.waterfall([ //---------------------------------------------------
      function (cb) {
        if(isSelf) {
          let fields = [DBFN.GUESTID_uuid_pc2i];
          let dbName = dbConst.USER_NEW_GUESTS.name;
          let constFields = [DBFN.USERID_uuid_pc1i];
          let constValues = [1];
          
          let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
          
          cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
            if (err) { return cb(err, null); }
            
            let newIds = [];
            
            for(let i = 0; i < result.rows.length; i++) {
              newIds.push(result.rows[i][DBFN.GUESTID_uuid_pc2i].toString());
            }
            
            cb(null, newIds);
          });
        } else { cb(null, []); }
        
      }, //---------------------------------------------------------------
      function (newIds, cb) {
        
        // Отбираем всех гостей
        let fields = [
          DBF.GUESTID_uuid_ci,
          DBF.GUESTVID_varchar,
          DBF.DATE_timestamp,
          DBF.GUESTBDATE_timestamp,
          DBF.GUESTSEX_int
        ];
        
        let constFields = [DBF.USERID_uuid_p];
        let constValues = [1];
        let dbName = dbConst.USER_GUESTS.name;
        
        //let query = "select guestid, guestvid, date FROM user_guests where userid = ?";
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);
        
        cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
          if (err) { return cb(err, null); }
          
          let guests = [];
          
            let row;
            for(let i = 0; i < result.rows.length; i++) {
              row = result.rows[i];
              
              let guest = {
                [PF.ID]   : row[DBF.GUESTID_uuid_ci].toString(),
                [PF.VID]  : row[DBF.GUESTVID_varchar],
                [PF.DATE] : row[DBF.DATE_timestamp],
                [PF.AGE]  : bdayToAge(row[DBF.GUESTBDATE_timestamp]),
                [PF.SEX]  : row[DBF.GUESTSEX_int]
              };
              
              if(isSelf) {
                guest[PF.ISNEW] = false;
                
                for(let nid = 0; nid < newIds.length; nid++) {
                  if(guest[PF.ID] == newIds[nid]) {
                    guest[PF.ISNEW] = true;
                  }
                }
              }
              
              guests.push(guest);
            }
  
            cb(null, { guests : guests, new_guests : newIds.length });
        });
      }
    ], // -------------------------------------------------------------
    function (err, guests) {
      if (err) { return callback(err, null); }
      
      callback(null, guests);
    });
  
};