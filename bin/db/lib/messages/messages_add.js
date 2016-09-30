var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

var async = require('async');
/*
 Добавить сообщение в БД: ИД, объект сообщения
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  var date         = options["date"] || new Date();
  var opened       = options["opened"];

  if (!date || !uid || !options["companionid"] || !options["text"] || !options["companionvid"]) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  var id = cdb.timeUuid.fromDate(date);

  async.waterfall([/////////////////////////////////////////////////////////////////////
    function(cb) { // Записываем сообщение либо в основную таблицу

      var fields = ["id", "userid", "date", "companionid", "companionvid", "incoming", "text"];

      //var query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERMESSAGES);

      var params = [id, uid, date, options["companionid"], options["companionvid"], options["incoming"], options["text"]];

      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, fields, params);
      });
    },///////////////////////////////////////////////////////////////////////////////////////
    function(fields, params, cb) { // Либо в таблицу новых сообщений (если оно еще не прочитано)
      if(!opened) {//
        //var query = "INSERT INTO user_new_messages (" + fields + ") VALUES (" + values + ")";
        var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERNEWMESSAGES);

        cdb.client.execute(query, params, { prepare: true },  function(err) {
          if (err) {  return cb(err); }

          cb(null, null);
        });
      } else cb(null, null);
    }, //////////////////////////////////////////////////////////////////////////////////////////
    function(res, cb) { // Добавляем чат
      var params = [uid, options["companionid"], opened];
      var fields = ["userid", "companionid", "isnew"];

      //var query = "INSERT INTO user_chats ( userid, companionid, isnew) VALUES (?, ?, ?)";
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERCHATS);

      cdb.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, null);
      });
    }//////////////////////////////////////////////////////////////////////////////////////////
  ], function(err, res) {
    if (err) {  return callback(err); }

    options["messageid"] = id.toString();

    callback(null, options);
  });
};