var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Добавить друга в БД: ИД, объект с данными друга
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, friend, callback) { friend = friend || {};

  if ( !uid || !friend["friendid"] || !friend["friendvid"]) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  async.waterfall([
    function (cb) {
      var fields = ["userid", "friendid", "friendvid", "date"];
      var params = [uid, friend["friendid"], friend["friendvid"], friend["date"]];
  
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERFRIENDS);
  
      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        cb(null, null);
      });
    },
    function (res, cb) {
      var fields = ["userid", "friendid"];
      var params = [uid, friend["friendid"]];
  
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USER_NEW_FRIENDS);
  
      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return cb(err); }
    
        cb(null, null);
      });
    }
  ],
  function (err) {
    if (err) {  return callback(err); }
    
    callback(null, friend);
  });

};


