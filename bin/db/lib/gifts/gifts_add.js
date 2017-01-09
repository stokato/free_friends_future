const async = require('async');

const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF   = dbConst.DB.USER_GIFTS.fields;
const DBFN  = dbConst.DB.USER_NEW_GIFTS.fields;
const PF    = dbConst.PFIELDS;

/*
 Добавить подарок: ИД игрока и объект с данными о подарке
 - Провека: все поля
 - Генерируем ИД подарка
 - Строим и выполняем запрос
 - Возвращаем объект подарка
 */
module.exports = function(uid, options, callback) { options = options || {};

  if (!uid) { return callback(new Error("Не указан Id пользователя"), null); }

  if (!options[PF.GIFTID] || !options[PF.SRC] || !options[PF.DATE] || !options[PF.ID] || !options[PF.VID]) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  let id = cdb.uuid.random();

  async.waterfall([ //--------------------------------------------------------------
    function (cb) {
      let fields = [
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
      
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_GIFTS.name);
  
      let params = [
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

  
      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        options[PF.UGIFTID] = id.toString();
    
        cb(null, null);
      });
    }, //-----------------------------------------------------------
    function (res, cb) {
      let fields = [
        DBFN.ID_uuid_p,
        DBFN.USERID_uuid_i
      ];
      
      let query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_NEW_GIFTS.name);
  
      let params = [id, uid];
  
      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }
    
        cb(null, null);
      });
    }
  ], //-------------------------------------------------------------------
  function (err) {
    if (err) {  return callback(err); }
    
    callback(null, options);
  })
};