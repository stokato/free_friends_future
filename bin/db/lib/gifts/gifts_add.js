var async = require('async');

var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USER_GIFTS.fields;
var DBFN = dbConst.DB.USER_NEW_GIFTS.fields;
var PF = dbConst.PFIELDS;

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

  var id = cdb.uuid.random();

  async.waterfall([ //--------------------------------------------------------------
    function (cb) {
      var fields = [
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
        DBF.FROMBDAY_timestamp
      ];
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_GIFTS.name);
  
      var params = [];
      params.push(id);
      params.push(uid);
      params.push(options[PF.GIFTID]);
      params.push(options[PF.TYPE]);
      params.push(options[PF.SRC]);
      params.push(options[PF.DATE]);
      params.push(options[PF.TITLE]);
      params.push(options[PF.ID]);
      params.push(options[PF.VID]);
      params.push(options[PF.SEX]);
      params.push(options[PF.BDATE]);
  
      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        options[PF.UGIFTID] = id.toString();
    
        cb(null, null);
      });
    }, //-----------------------------------------------------------
    function (res, cb) {
      var fields = [
        DBFN.ID_uuid_p,
        DBFN.USERID_uuid_i
      ];
      
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USER_NEW_GIFTS.name);
  
      var params = [id, uid];
  
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