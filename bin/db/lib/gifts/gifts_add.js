const async = require('async');

const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF       = require('./../../../const_fields');

/*
 Добавить подарок: ИД игрока и объект с данными о подарке
 - Провека: все поля
 - Генерируем ИД подарка
 - Строим и выполняем запрос
 - Возвращаем объект подарка
 */
module.exports = function(uid, options, callback) { options = options || {};
  
  const DBF   = DB_CONST.USER_GIFTS.fields;
  const DBN   = DB_CONST.USER_GIFTS.name;
  
  const DBFN  = DB_CONST.USER_NEW_GIFTS.fields;
  const DBNN  = DB_CONST.USER_NEW_GIFTS.name;
  
  if (!uid) {
    return callback(new Error("Не указан Id пользователя"), null);
  }

  if (!options[PF.GIFTID] ||
      !options[PF.SRC] ||
      !options[PF.DATE] ||
      !options[PF.ID] ||
      !options[PF.VID]) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  let id = dbCtrlr.uuid.random();

  async.waterfall([ //--------------------------------------------------------------
    // Добавляем подарок в основную таблицу
    function (cb) {
      let fieldsArr = [
        DBF.ID_uuid_p,
        DBF.USERID_uuid_i,
        DBF.GIFTID_varchar,
        DBF.TYPE_varchar,
        DBF.SRC_varhar,
        DBF.DATE_timestamp,
        DBF.TITLE_varchar,
        DBF.FROMID_uuid,
        DBF.FROMVID_varchar,
        DBF.FROMSEX_int,
        DBF.FROMBDATE_timestamp
      ];
  
      let paramsArr = [
        id,
        uid,
        options[PF.GIFTID],
        options[PF.TYPE],
        options[PF.SRC],
        options[PF.DATE],
        options[PF.TITLE],
        options[PF.ID],
        options[PF.VID],
        options[PF.SEX],
        options[PF.BDATE]
      ];
      
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBN);
      
      dbCtrlr.client.execute(query, paramsArr, { prepare: true },  (err) => {
        if (err) {  return cb(err); }
    
        options[PF.UGIFTID] = id.toString();
    
        cb(null, null);
      });
    }, //-----------------------------------------------------------
    // И в таблицу новых товаров
    function (res, cb) {
    
      let fieldsArr = [
        DBFN.ID_uuid_p,
        DBFN.USERID_uuid_i
      ];
      
      let paramsArr = [id, uid];
      
      let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fieldsArr, DBNN);
      
      dbCtrlr.client.execute(query, paramsArr, { prepare: true },  function(err) {
        if (err) {
          return cb(err);
        }
    
        cb(null, null);
      });
    }
  ], //-------------------------------------------------------------------
  function (err) {
    if (err) {
      return callback(err);
    }
    
    callback(null, options);
  })
};