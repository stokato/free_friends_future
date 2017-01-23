const async = require('async');

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Добавить сообщение в БД: ИД, объект сообщения
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  
  const DBF   = DB_CONST.USER_MESSAGES.fields;
  const DBN   = DB_CONST.USER_MESSAGES.name;
  
  const DBFN  = DB_CONST.USER_NEW_MESSAGES.fields;
  const DBNN  = DB_CONST.USER_NEW_MESSAGES.name;
  
  const DBFC  = DB_CONST.USER_CHATS.fields;
  const DBNC  = DB_CONST.USER_CHATS.name;
  
  const DBFCN = DB_CONST.USER_NEW_CHATS.fields;
  const DBNCN = DB_CONST.USER_NEW_CHATS.name;

  let date    = options[PF.DATE] || new Date();
  let opened  = options[PF.OPENED];

  if (!date ||
      !uid ||
      !options[PF.FID] ||
      !options[PF.TEXT] ||
      !options[PF.VID] ||
      !options[PF.FVID]) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  let id = dbCtrlr.timeUuid.fromDate(date);

  async.waterfall([/////////////////////////////////////////////////////////////////////
    function(cb) { // Записываем сообщение либо в основную таблицу

      let fieldsArr = [
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
  
      let paramsArr = [
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
      
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBN);

      dbCtrlr.client.execute(query, paramsArr, { prepare: true },  (err) => {
        if (err) {
          return cb(err);
        }

        cb(null, null);
      });
    },//-------------------------------------------------------------------
    function(res, cb) { // Либо в таблицу новых сообщений (если оно еще не прочитано)
      if(!opened) {
        let fieldsArr = [
          DBFN.ID_timeuuid_c,
          DBFN.USERID_uuid_pci,
          DBFN.COMPANIONID_uuid_pc2i
        ];
        
        let paramsArr = [
          id,
          uid,
          options[PF.FID]
        ];
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBNN);

        dbCtrlr.client.execute(query, paramsArr, { prepare: true },  (err) => {
          if (err) {
            return cb(err);
          }
          
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
        
        let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fields, DBNCN);
  
        dbCtrlr.client.execute(query, params, { prepare: true },  (err) => {
          if (err) {
            return cb(err);
          }
    
          cb(null, null);
        });
      } else cb(null, null);
    }, //-------------------------------------------------------------------
    function(res, cb) { // Добавляем чат
      
      let fieldsArr = [
        DBFC.USERID_uuid_p,
        DBFC.COMPANIONID_uuid_c,
        DBFC.ISNEW_boolean,
        DBFC.COMPANIONSEX_int,
        DBFC.COMPANIONBDATE_timestamp,
        DBFC.COMPANIONVID_varchar
      ];
  
      let paramsArr = [
        uid,
        options[PF.FID],
        opened,
        options[PF.FSEX],
        options[PF.FBDATE],
        options[PF.FVID]
      ];
      
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBNC);

      dbCtrlr.client.execute(query, paramsArr, { prepare: true },  (err) => {
        if (err) {
          return cb(err);
        }

        cb(null, null);
      });
    }//-------------------------------------------------------------------
  ], function(err) {
    if (err) {
      return callback(err);
    }

    options[PF.MESSAGEID] = id.toString();

    callback(null, options);
  });
};