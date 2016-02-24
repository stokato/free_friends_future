var async = require('async');
/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) {
  var self = this;
 var companions = options.id_list || [];
 var date = options.date;

 if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
 if (!companions[0]) { return callback(new Error("Задан пустой Id собеседника"), null); }

  var fields = "";
  var params = [uid];
  for(var i = 0; i < companions.length; i++) {
    if (fields == "")
      fields = fields + "?";
    else
      fields = fields + ", " + "?";

    params.push(companions[i]);
  }
  async.waterfall([
    function(cb) {
      var query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";
      var params2 = params.slice(0);
      if (date) {
        query = query + " and id > ?";
        params2.push(self.timeUuid.fromDate(date));
      }

      self.client.execute(query, params2, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
        var messages = [];

        if(result.rows.length > 0) {
          for(var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i];
            var message = {
              id           : row.id,
              date         : row.date,
              companionid  : row.companionid,
              companionvid : row.companionvid,
              incoming     : row.incoming,
              text         : row.text,
              opened       : true
            };
            messages.push(message);
          }
          cb(null, messages);
        } else {
          cb(null, null);
        }
      });
    },
    function(messages, cb) {
      var query = "select * FROM user_new_messages where userid = ? and companionid in (" + fields + ")";
      self.client.execute(query, params, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }

        if(result.rows.length > 0) {
          var rows = result.rows;
          var fields2 = "?";
          var params2 = params.slice(0);
          params2[params2.length] = rows[0].messageid;
          for(var i = 1; i < rows.length; i++) {
            params2.push(rows[i].messageid);
            fields2 = fields2 + ", ?";
          }
          cb(null, messages, params2, fields2);
        } else cb(null, messages, null, null);
      });
    },
    function( messages, params2, fields2, cb) {
      if(!params2) { return cb(null, messages) }
      var query = "select * FROM user_messages where userid = ? and companionid in (" + fields +
                    ") and id in (" + fields2 + ")";

      self.client.execute(query, params2, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }

        var newMessages = [];

        if(result.rows.length > 0) {
          for(var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i];
            var message = {
              id           : row.id,
              date         : row.date,
              companionid  : row.companionid,
              companionvid : row.companionvid,
              incoming     : row.incoming,
              text         : row.text,
              opened       : false
            };
            newMessages.push(message);
          }

          var resultMessages = messages.slice(0);
          for(var i = 0; i < newMessages.length; i++) {
            var m = true;
            for(var j = 0; j < messages.length; j++) {
              if(newMessages[i].id.toString() == messages[j].id.toString()) {
                m = false;
                resultMessages[j].opened = false;
              }
            }
            if(m) { resultMessages.push(newMessages[i]); }
          }
          cb(null, resultMessages);
        } else {
          cb(null, messages);
        }
      });
    },
    function(messages, cb) {
      var query = "DELETE FROM user_new_messages WHERE userid = ? and companionid in ( " + fields + " )";
      self.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err); }

        cb(null, messages);
      });
    }
  ], function(err, result) {
    if(err) return callback(err, null);

    callback(null, result);
  })

};


