var C = require('../constants');
var qBuilder = require('./build_query');

var async = require('async');
/*
 Добавить сообщение в БД: ИД, объект сообщения
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  var self = this;
  //var f = C.IO.FIELDS;

  var date         = options["date"] || new Date();
  var opened       = options["opened"];

  if (!date || !uid || !options["companionid"] || !options["text"] || !options["companionvid"]) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  var id = self.timeUuid.fromDate(date);

  async.waterfall([
    function(cb) {/////////////////////////////////////////////////////////////////////

      var fields = ["id", "userid", "date", "companionid", "companionvid", "incoming", "text"];
      //var query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";
      var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERMESSAGES);

      var params = [id, uid, date, options["companionid"],
                          options["companionvid"], options["incoming"], options["text"]];

      self.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, fields, params);
      });
    },///////////////////////////////////////////////////////////////////////////////////////
    function(fields, params, cb) {
      if(!opened) {//
        //var query = "INSERT INTO user_new_messages (" + fields + ") VALUES (" + values + ")";
        var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERNEWMESSAGES);

        self.client.execute(query, params, { prepare: true },  function(err) {
          if (err) {  return cb(err); }

          cb(null, null);
        });
      } else cb(null, null);
    },
    function(res, cb) {/////////////////////////////////////////////////////////////////////////
      var params = [uid, options["companionid"], opened];

      var fields = ["userid", "companionid", "isnew"];
      //var query = "INSERT INTO user_chats ( userid, companionid, isnew) VALUES (?, ?, ?)";
      var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERCHATS);

      self.client.execute(query, params, { prepare: true },  function(err) {
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