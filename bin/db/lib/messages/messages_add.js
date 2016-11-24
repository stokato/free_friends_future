var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_MESSAGES.fields;
var DBFN = dbConst.DB.USER_NEW_MESSAGES.fields;
var DBFC = dbConst.DB.USER_CHATS.fields;
var PF = dbConst.PFIELDS;
var bdayToAge = require('./../common/bdayToAge');

/*
 Добавить сообщение в БД: ИД, объект сообщения
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  var date         = options[PF.DATE] || new Date();
  var opened       = options[PF.OPENED];

  if (!date || !uid || !options[PF.ID] || !options[PF.TEXT] || !options[PF.VID]) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  var id = cdb.timeUuid.fromDate(date);

  async.waterfall([/////////////////////////////////////////////////////////////////////
    function(cb) { // Записываем сообщение либо в основную таблицу

      var fields = [
        DBF.ID_timeuuid_c,
        DBF.USERID_uuid_pci,
        DBF.DATE_timestamp,
        DBF.COMPANIONID_uuid_pc2i,
        DBF.COMPANIONVID_varchar,
        DBF.INCOMING_boolean,
        DBF.TEXT_text,
        DBF.COMPANIONSEX_int,
        DBF.COMPANIONBDAY_timestamp,
        DBF.USERSEX_int,
        DBF.USERBDAY_timestamp
      ];
  
      var params = [
        id,
        uid,
        date,
        options[PF.ID],
        options[PF.VID],
        options[PF.INCOMING],
        options[PF.TEXT],
        options[PF.SEX],
        options[PF.BDATE],
        options[PF.FSEX],
        options[PF.FBDAY]
      ];

      //var query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_MESSAGES.name);

      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, null);
      });
    },//-------------------------------------------------------------------
    function(res, cb) { // Либо в таблицу новых сообщений (если оно еще не прочитано)
      if(!opened) {
        var fields = [
          DBFN.ID_timeuuid_c,
          DBFN.USERID_uuid_pci,
          DBFN.COMPANIONID_uuid_pc2i
        ];
        
        var params = [
          id,
          uid,
          options[PF.ID]
        ];
        
        //var query = "INSERT INTO user_new_messages (" + fields + ") VALUES (" + values + ")";
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_NEW_MESSAGES.name);

        cdb.client.execute(query, params, { prepare: true },  function(err) {
          if (err) {  return cb(err); }

          cb(null, null);
        });
      } else cb(null, null);
    }, //-------------------------------------------------------------------
    function(res, cb) { // Добавляем чат
      
      var fields = [
        DBFC.USERID_uuid_p,
        DBFC.COMPANIONID_uuid_c,
        DBFC.ISNEW_boolean,
        DBFC.COMPANIONSEX_int,
        DBFC.COMPANIONBDAY_timestamp,
        DBFC.COMPANIONVID_varchar
      ];
  
      var params = [
        uid,
        options[PF.ID],
        opened,
        options[PF.BDATE],
        options[PF.SEX],
        options[PF.VID]
      ];

      //var query = "INSERT INTO user_chats ( userid, companionid, isnew) VALUES (?, ?, ?)";
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_CHATS.name);

      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, null);
      });
    }//-------------------------------------------------------------------
  ], function(err) {
    if (err) {  return callback(err); }

    options[PF.MESSAGEID] = id.toString();

    callback(null, options);
  });
};