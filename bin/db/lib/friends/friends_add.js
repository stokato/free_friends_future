var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_FRIENDS.fields;
var DBFN = dbConst.DB.USER_NEW_FRIENDS.fields;
var PF = dbConst.PFIELDS;

/*
 Добавить друга в БД: ИД, объект с данными друга
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, options, callback) { options = options || {};

  if ( !uid || !options[PF.ID] || !options[PF.VID]) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  async.waterfall([ //-------------------------------------------------------------
    function (cb) {
      var fields = [
        DBF.USERID_uuid_pi,
        DBF.FRIENDID_uuid_c,
        DBF.FRIENDVID_varhcar,
        DBF.DATE_timestamp,
        DBF.FRIENDSEX_int,
        DBF.FRIENDBDATE_timestamp
      ];
      
      var params = [
        uid,
        options[PF.ID],
        options[PF.VID],
        options[PF.DATE],
        options[PF.SEX],
        options[PF.BDATE]
      ];
  
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_FRIENDS.name);
  
      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        cb(null, null);
      });
    }, //------------------------------------------------------------------------------
    function (res, cb) {
      
      var fields = [
        DBFN.USERID_uuid_pi,
        DBFN.FRIENDID_uuid_c
      ];
      
      var params = [
        uid,
        options[PF.ID]
      ];
  
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_NEW_FRIENDS.name);
  
      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        cb(null, null);
      });
    }
  ], //------------------------------------------------------------------------------------
  function (err) {
    if (err) {  return callback(err); }
    
    callback(null, options);
  });

};


