/**
 * Добавляем запись в базу о друге
 * Добавляем запись в таблицу новых друзей
 *
 * @param String uid - ид пользователя, Object options - набор полей для записи в базу, func callback
 * @return Object options
 */

const async = require('async');

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF       = require('./../../../const_fields');

/*
 Добавить друга в БД: ИД, объект с данными друга
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, options, callback) { options = options || {};
  
  const DBF     = DB_CONST.USER_FRIENDS.fields;
  const DBN     = DB_CONST.USER_FRIENDS.name;
  
  const DBFN    = DB_CONST.USER_NEW_FRIENDS.fields;
  const DBNN    = DB_CONST.USER_NEW_FRIENDS.name;
  
  if ( !uid || !options[PF.ID] || !options[PF.VID]) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  async.waterfall([ //-------------------------------------------------------------
    // Добавляем запись в основную таблицу друзей
    function (cb) {
      let fieldsArr = [
        DBF.USERID_uuid_pi,
        DBF.FRIENDID_uuid_c,
        DBF.FRIENDVID_varhcar,
        DBF.DATE_timestamp,
        DBF.FRIENDSEX_int,
        DBF.FRIENDBDATE_timestamp
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
  
      dbCtrlr.client.execute(query, paramsArr, { prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }
    
        cb(null, null);
      });
    }, //------------------------------------------------------------------------------
    // Затем добавляем с таблицу новых
    function (res, cb) {
      
      let fieldsArr = [
        DBFN.USERID_uuid_pc1i,
        DBFN.FRIENDID_uuid_pc2
      ];
      
      let paramsArr = [
        uid,
        options[PF.ID]
      ];
  
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBNN);
  
      dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
        if (err) {
          return cb(err);
        }
    
        cb(null, null);
      });
    }
  ], //------------------------------------------------------------------------------------
  function (err) {
    if (err) {
      return callback(err);
    }
    
    callback(null, options);
  });

};


