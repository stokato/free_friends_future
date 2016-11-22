var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF  = require('./../../constants').PFIELDS;
/*
 Добавить подарок: ИД игрока и объект с данными о подарке
 - Провека: все поля
 - Генерируем ИД подарка
 - Строим и выполняем запрос
 - Возвращаем объект подарка
 */
module.exports = function(uid, options, callback) { options = options || {};
  //var f = C.IO.FIELDS;

  if (!uid) { return callback(new Error("Не указан Id пользователя"), null); }

  if (!options[PF.GIFTID] || !options[PF.SRC] || !options[PF.DATE] || !options[PF.ID]
    || !options[PF.VID]) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  var id = cdb.uuid.random();

  async.waterfall([
    function (cb) {
      var fields = ["id", "userid", "giftid", "type", "src", "date", "title", "fromid", "fromvid"];
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERGIFTS);
  
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
  
      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        options[PF.GID] = id.toString();
    
        cb(null, null);
      });
    },
    function (res, cb) {
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, ["id", "userid"], constants.T_USER_NEW_GIFTS);
  
      var params = [id, uid];
  
      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }
    
        cb(null, null);
      });
    }
  ],
  function (err) {
    if (err) {  return callback(err); }
    
    callback(null, options);
  })
};