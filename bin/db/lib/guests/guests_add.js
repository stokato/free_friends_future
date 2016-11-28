var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_GUESTS.fields;
var DBFN = dbConst.DB.USER_NEW_GUESTS.fields;
var PF = dbConst.PFIELDS;

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
      var fields = [
        DBF.USERID_uuid_p,
        DBF.GUESTID_uuid_ci,
        DBF.GUESTVID_varchar,
        DBF.DATE_timestamp,
        DBF.GUESTSEX_int,
        DBF.GUESTBDATE_timestamp
      ];
      
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_GUESTS.name);
  
      var params = [
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
        var fields = [
          DBFN.USERID_uuid_pc1i,
          DBFN.GUESTID_uuid_pc2i
        ];
      
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_NEW_GUESTS.name);
      
        var params = [
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