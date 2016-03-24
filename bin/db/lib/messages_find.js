var async = require('async');

var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  var self = this;

  var f = C.IO.FIELDS;

  var companions = options.id_list || [];
  var firstDate =  options[f.first_date];
  var secondDate = options[f.second_date];

  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
  if (!companions[0]) { return callback(new Error("Задан пустой Id собеседника"), null); }

  var fields = "";
  var params = [uid];
  var i;
  var compLen = companions.length;
  for(i = 0; i < compLen; i++) {
    if (fields == "") { fields = fields + "?"; }
    else { fields = fields + ", " + "?"; }

    params.push(companions[i]);
  }
  async.waterfall([/////////////////////////////////////////////////////////
    function(cb) { // Получаем историю сообщений за указанный период (прочитанных)
      //var query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";
      var const_more, const_less;
      var params2 = params.slice(0);
      if (firstDate) {
        const_more = const_less = f.id;
        params2.push(self.timeUuid.fromDate(firstDate));
        params2.push(self.timeUuid.fromDate(secondDate));
      }

      var query = qBuilder.build(qBuilder.Q_SELECT, [qBuilder.ALL_FIELDS], C.T_USERMESSAGES,
                     [f.userid, f.companionid],[1, companions.length], const_more, const_less);

      self.client.execute(query, params2, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
        var messages = [];

        var i, rowsLen = result.rows.length;
        if(rowsLen > 0) {
          for(i = 0; i < rowsLen; i++) {
            var row = result.rows[i];

            var message = {};
            message[f.id]        = row[f.id].toString();
            message[f.date]        = row[f.date];
            message[f.companionid] = row[f.companionid].toString();
            message[f.companionvid]    = row[f.companionvid];
            message[f.incoming]    = row[f.incoming];
            message[f.text]        = row[f.text];
            message[f.opened]    = true;
            message[f.userid] = uid;

            messages.push(message);
          }
          cb(null, messages);
        } else {
          cb(null, null);
        }
      });
    },//////////////////////////////////////////////////////////////////////////////
    function(messages, cb) { // Получаем все непрочитанный сообщения
      //var query = "select * FROM user_new_messages where userid = ? and companionid in (" + fields + ")";
      var query = qBuilder.build(qBuilder.Q_SELECT, [qBuilder.ALL_FIELDS], C.T_USERNEWMESSAGES,
                                        [f.userid, f.companionid], [1, companions.length]);

      self.client.execute(query, params, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
        var newMessages = [];

        var rowsLen = result.rows.length;
        if(rowsLen > 0) {
          for(i = 0; i < rowsLen; i++) {
            var row = result.rows[i];

            var message = {};
            message[f.id]           = row[f.id].toString();
            message[f.date]         = row[f.date];
            message[f.companionid]  = row[f.companionid].toString();
            message[f.companionvid] = row[f.companionvid];
            message[f.incoming]     = row[f.incoming];
            message[f.text]         = row[f.text];
            message[f.opened]       = false;
            message[f.userid]       = uid;

            newMessages.push(message);
          }

          var i, j;
          var len = messages.length;
          var newMesLen = newMessages.length;
          for(i = 0; i < newMesLen; i++) {
            var noSuch = true;
            for(j = 0; j < len; j++) {
              if(newMessages[i][f.id] == messages[j][f.id]) {
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
    },/////////////////////////////////////////////////////////////////////////////
    function(messages, cb) {
      //var query = "DELETE FROM user_new_messages WHERE userid = ? and companionid in ( " + fields + " )";
      var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERNEWMESSAGES,
                          [f.userid, f.companionid], [1, companions.length]);

      self.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err, null); }

        cb(null, messages);
      });
    },////////////////////////////////////////////////////////////////////////////////
    function(messages, cb) {

      var count = 0;

      updateChat(self.client, uid, companions, count, function(err, res) {
        if(err) { return cb(err, null); }

        cb(null, messages);
      });
    }//////////////////////////////////////////////////////////////////////////////////
  ], function(err, messages) {
    if(err) return callback(err, null);

    callback(null, messages);
  })
};

function updateChat(db, uid, companions, count, callback) {
  //var query = "update user_chats set isnew = ? where userid = ? and companionid = ?";
  var f = C.IO.FIELDS;

  var query = qBuilder.build(qBuilder.Q_UPDATE, [f.isnew], C.T_USERCHATS,
    [f.userid, f.companionid], [1, 1]);
  var params = [false, uid, companions[count]];

  db.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err, null); }

    count++;

    if(count < companions.length) {
      updateChat(db, uid, companions, count, callback);
    } else {
      callback(null, null);
    }
  });
}

