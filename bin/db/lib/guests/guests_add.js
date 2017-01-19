const async = require('async');

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF       = require('./../../../const_fields');

/*
 Добавить гостя в БД: ИД, объект с данными гостя
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, options, callback) { options = options || {};

  const DBF   = DB_CONST.USER_GUESTS.fields;
  const DBN   = DB_CONST.USER_GUESTS.name;
  
  const DBFN  = DB_CONST.USER_NEW_GUESTS.fields;
  const DBNN  = DB_CONST.USER_NEW_GUESTS.name;
  
  if (!uid ||
      !options[PF.ID] ||
      !options[PF.DATE] ||
      !options[PF.VID]) {
    return callback(new Error("Не указан Id пользователя или его гостя, либо дата"), null);
  }

  async.waterfall([ //----------------------------------------------
    function (cb) {
      let fieldsArr = [
        DBF.USERID_uuid_p,
        DBF.GUESTID_uuid_ci,
        DBF.GUESTVID_varchar,
        DBF.DATE_timestamp,
        DBF.GUESTSEX_int,
        DBF.GUESTBDATE_timestamp
      ];
      
      let paramsArr = [
        uid,
        options[PF.ID],
        options[PF.VID],
        options[PF.DATE],
        options[PF.SEX],
        options[PF.BDATE]
      ];
      
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBN);
  
      dbCtrlr.client.execute(query, paramsArr, {prepare: true },  (err) => {
        if (err) {
          return cb(err);
        }
    
        cb(null, options);
      });
    }, //-----------------------------------------------------------------
      function (res, cb) {
    
        let fieldsArr = [
          DBFN.USERID_uuid_pc1i,
          DBFN.GUESTID_uuid_pc2i
        ];
  
        let paramsArr = [
          uid,
          options[PF.ID]
        ];
      
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBNN);

        dbCtrlr.client.execute(query, paramsArr, { prepare: true },  (err) => {
          if (err) {
            return cb(err);
          }
        
          cb(null, null);
        });
      }
  ], //------------------------------------------------------------------
  function (err) {
    if (err) {
      return callback(err);
    }
  
    callback(null, options);
  });
};