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
 var firstDate = options.fdate;
 var secondDate = options.sdate;

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
  async.waterfall([/////////////////////////////////////////////////////////
    function(cb) { // Получаем историю сообщений за указанный период (прочитанных)
      var query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";
      var params2 = params.slice(0);
      if (firstDate) {
        query = query + " and id > ? and id < ?";
        params2.push(self.timeUuid.fromDate(firstDate));
        params2.push(self.timeUuid.fromDate(secondDate));
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
              opened       : true,
              userid       : uid
            };
            messages.push(message);
          }
          cb(null, messages);
        } else {
          cb(null, null);
        }
      });
    },
    function(messages, cb) { // Получаем все непрочитанный сообщения
      var query = "select * FROM user_new_messages where userid = ? and companionid in (" + fields + ")";
      self.client.execute(query, params, {prepare: true }, function(err, result) {
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
              opened       : false,
              userid       : uid
            };
            newMessages.push(message);
          }

          var len = messages.length;
          for(var i = 0; i < newMessages.length; i++) {
            var noSuch = true;
            for(var j = 0; j < len; j++) {
              if(newMessages[i].id.toString() == messages[j].id.toString()) {
                noSuch = false;
              }
            }
            if(noSuch) messages.push(newMessages[i]);
          }
          cb(null, messages);
        } else {
          cb(null, messages);
        }
      });
    },
    function(messages, cb) {
      var query = "DELETE FROM user_new_messages WHERE userid = ? and companionid in ( " + fields + " )";
      self.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err, null); }

        cb(null, messages);
      });
    },
    function(messages, cb) {
      async.map(companions, function(companion, cb_map) {
          var query = "update user_chats set isnew = ? where userid = ? and companionid = ?";
          var params = [false, uid, companion];
          self.client.execute(query, params, {prepare: true },  function(err) {
            if (err) {  return cb_map(err, null); }

            cb_map(null, null);
          });
        },
        function(err, res) {
          if (err) {  return cb(err, null); }

          cb(null, messages);
        })
    }
  ], function(err, messages) {
    if(err) return callback(err, null);

    callback(null, messages);
  })

};


