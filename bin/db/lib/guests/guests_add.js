const async = require('async');

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF   = dbConst.USER_GUESTS.fields;
const DBFN  = dbConst.USER_NEW_GUESTS.fields;
const PF    = constants.PFIELDS;

/*
 Добавить гостя в БД: ИД, объект с данными гостя
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, options, callback) { options = options || {};

  if ( !uid || !options[PF.ID] || !options[PF.DATE] || !options[PF.VID]) {
    return callback(new Error("Не указан Id пользователя или его гостя, либо дата"), null);
  }

  async.waterfall([ //----------------------------------------------
    function (cb) {
      let fields = [
        DBF.USERID_uuid_p,
        DBF.GUESTID_uuid_ci,
        DBF.GUESTVID_varchar,
        DBF.DATE_timestamp,
        DBF.GUESTSEX_int,
        DBF.GUESTBDATE_timestamp
      ];
      
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.USER_GUESTS.name);
  
      let params = [
        uid,
        options[PF.ID],
        options[PF.VID],
        options[PF.DATE],
        options[PF.SEX],
        options[PF.BDATE]
      ];
  
      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        cb(null, options);
      });
    }, //-----------------------------------------------------------------
      function (res, cb) {
        let fields = [
          DBFN.USERID_uuid_pc1i,
          DBFN.GUESTID_uuid_pc2i
        ];
      
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.USER_NEW_GUESTS.name);
      
        let params = [
          uid,
          options[PF.ID]
        ];
      
        cdb.client.execute(query, params, { prepare: true },  function(err) {
          if (err) { return cb(err); }
        
          cb(null, null);
        });
      }
  ], //------------------------------------------------------------------
  function (err) {
    if (err) {  return callback(err); }
  
    callback(null, options);
  });
};