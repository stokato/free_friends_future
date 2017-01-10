/**
 * Добавляем запись в базу о друге
 * Добавляем запись в таблицу новых друзей
 *
 * @param String uid - ид пользователя, Object options - набор полей для записи в базу, func callback
 * @return Object options
 */

const async = require('async');

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');
const constants = require('./../../../constants');

const DBF     = dbConst.USER_FRIENDS.fields;
const DBFN    = dbConst.USER_NEW_FRIENDS.fields;
const PF      = constants.PFIELDS;

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
      let fields = [
        DBF.USERID_uuid_pi,
        DBF.FRIENDID_uuid_c,
        DBF.FRIENDVID_varhcar,
        DBF.DATE_timestamp,
        DBF.FRIENDSEX_int,
        DBF.FRIENDBDATE_timestamp
      ];
      
      let params = [
        uid,
        options[PF.ID],
        options[PF.VID],
        options[PF.DATE],
        options[PF.SEX],
        options[PF.BDATE]
      ];
  
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.USER_FRIENDS.name);
  
      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        cb(null, null);
      });
    }, //------------------------------------------------------------------------------
    function (res, cb) {
      
      let fields = [
        DBFN.USERID_uuid_pc1i,
        DBFN.FRIENDID_uuid_pc2
      ];
      
      let params = [
        uid,
        options[PF.ID]
      ];
  
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.USER_NEW_FRIENDS.name);
  
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


