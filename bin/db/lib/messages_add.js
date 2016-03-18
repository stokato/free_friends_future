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
  var f = C.IO.FIELDS;

  var date         = options[f.date] || new Date();
  var opened       = options[f.opened];

  if (!date || !uid || !options[f.companionid] || !options[f.text] || !options[f.companionvid]) {
    return callback(new Error("Не указан один из параметров сообщения"), null);
  }

  async.waterfall([
    function(cb) {/////////////////////////////////////////////////////////////////////
      var id = self.timeUuid.fromDate(date);

      var fields = [f.id, f.userid, f.date, f.companionid, f.companionvid, f.incoming, f.text];
      //var query = "INSERT INTO user_messages (" + fields + ") VALUES (" + values + ")";
      var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERMESSAGES);

      var params = [id, uid, date, options[f.companionid],
                          options[f.companionvid], options[f.incoming], options[f.text]];

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
      var params = [uid, options[f.companionid], opened];

      var fields = [f.userid, f.companionid, f.isnew];
      //var query = "INSERT INTO user_chats ( userid, companionid, isnew) VALUES (?, ?, ?)";
      var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERCHATS);

      self.client.execute(query, params, { prepare: true },  function(err) {
        if (err) { return cb(err); }

        cb(null, null);
      });
    }//////////////////////////////////////////////////////////////////////////////////////////
  ], function(err, res) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};