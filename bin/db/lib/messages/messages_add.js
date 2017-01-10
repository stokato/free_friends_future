const async = require('async');

const cdb       = require('./../common/cassandra_db');
const dbConst   = require('./../../constants');
const constants = require('./../../../constants');

const DBF = dbConst.USER_MESSAGES.fields;
const DBFN = dbConst.USER_NEW_MESSAGES.fields;
const DBFC = dbConst.USER_CHATS.fields;
const DBFCN = dbConst.USER_NEW_CHATS.fields;
const PF = constants.PFIELDS;


/*
 Добавить сообщение в БД: ИД, объект сообщения
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  let date         = options[PF.DATE] || new Date();
  let opened       = options[PF.OPENED];

  if (!date || !uid || !options[PF.FID] || !options[PF.TEXT] || !options[PF.VID] || !options[PF.FVID]) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  let id = cdb.timeUuid.fromDate(date);

  async.waterfall([/////////////////////////////////////////////////////////////////////
    function(cb) { // Записываем сообщение либо в основную таблицу

      let fields = [
        DBF.ID_timeuuid_c,
        DBF.USERID_uuid_pci,
        DBF.DATE_timestamp,
        DBF.COMPANIONID_uuid_pc2i,
        DBF.COMPANIONVID_varchar,
        DBF.INCOMING_boolean,
        DBF.TEXT_text,
        DBF.COMPANIONSEX_int,
        DBF.COMPANIONBDATE_timestamp,
        DBF.USERSEX_int,
        DBF.USERBDATE_timestamp,
        DBF.USERVID_varchar
      ];
  
      let params = [
        id,
        uid,
        date,
        options[PF.FID],
        options[PF.FVID],
        options[PF.INCOMING],
        options[PF.TEXT],
        options[PF.FSEX],
        options[PF.FBDATE],
        options[PF.SEX],
        options[PF.BDATE],
        options[PF.VID]
      ];

      //let query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.USER_MESSAGES.name);

      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, null);
      });
    },//-------------------------------------------------------------------
    function(res, cb) { // Либо в таблицу новых сообщений (если оно еще не прочитано)
      if(!opened) {
        let fields = [
          DBFN.ID_timeuuid_c,
          DBFN.USERID_uuid_pci,
          DBFN.COMPANIONID_uuid_pc2i
        ];
        
        let params = [
          id,
          uid,
          options[PF.FID]
        ];
        
        //let query = "INSERT INTO user_new_messages (" + fields + ") VALUES (" + values + ")";
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.USER_NEW_MESSAGES.name);

        cdb.client.execute(query, params, { prepare: true },  function(err) {
          if (err) {  return cb(err); }
          
          

          cb(null, null);
        });
      } else cb(null, null);
    }, //-------------------------------------------------------------------
    function(res, cb) { // Добавляем в новые чаты
      if(!opened) {
        let fields = [
          DBFCN.USERID_uuid_pc1i,
          DBFCN.COMPANIONID_uuid_pc2
        ];
  
        let params = [
          uid,
          options[PF.FID]
        ];
  
        //let query = "INSERT INTO user_chats ( userid, companionid, isnew) VALUES (?, ?, ?)";
        let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.USER_NEW_CHATS.name);
  
        cdb.client.execute(query, params, { prepare: true },  function(err) {
          if (err) { return cb(err); }
    
          cb(null, null);
        });
      } else cb(null, null);
    }, //-------------------------------------------------------------------
    function(res, cb) { // Добавляем чат
      
      let fields = [
        DBFC.USERID_uuid_p,
        DBFC.COMPANIONID_uuid_c,
        DBFC.ISNEW_boolean,
        DBFC.COMPANIONSEX_int,
        DBFC.COMPANIONBDATE_timestamp,
        DBFC.COMPANIONVID_varchar
      ];
  
      let params = [
        uid,
        options[PF.FID],
        opened,
        options[PF.FSEX],
        options[PF.FBDATE],
        options[PF.FVID]
      ];

      //let query = "INSERT INTO user_chats ( userid, companionid, isnew) VALUES (?, ?, ?)";
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.USER_CHATS.name);

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