var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF = require('./../../constants').PFIELDS;

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

  async.waterfall([
    function (cb) {
      var fields = ["userid", "guestid", "guestvid", "date"];
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERGUESTS);
  
      var params = [uid, options[PF.ID], options[PF.VID], options[PF.DATE] ];
  
      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        cb(null, options);
      });
    },
      function (res, cb) {
        var fields = ["userid", "guestid"];
      
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USER_NEW_GUESTS);
      
        var params = [uid, options[PF.ID]];
      
        cdb.client.execute(query, params, { prepare: true },  function(err) {
          if (err) { return cb(err); }
        
          cb(null, null);
        });
      }
  ],
  function (err) {
    if (err) {  return callback(err); }
  
    callback(null, options);
  });
};