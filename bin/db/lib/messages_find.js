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

  //var f = C.IO.FIELDS;

  var companions = options.id_list || [];
  var firstDate =  options["first_date"];
  var secondDate = options["second_date"];

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
        const_more = const_less = "id";
        params2.push(self.timeUuid.fromDate(firstDate));
        params2.push(self.timeUuid.fromDate(secondDate));
      }

      var query = qBuilder.build(qBuilder.Q_SELECT, [qBuilder.ALL_FIELDS], C.T_USERMESSAGES,
                     ["userid", "companionid"],[1, companions.length], const_more, const_less);

      self.client.execute(query, params2, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
        var messages = [];

        var i, rowsLen = result.rows.length;
        if(rowsLen > 0) {
          for(i = 0; i < rowsLen; i++) {
            //var row = result.rows[i];
            //
            //var message = {};
            //message["id"]        = row["id].toString();
            //message["date"]        = row["date];
            //message["companionid"] = row["companionid].toString();
            //message["companionvid"]    = row["companionvid];
            //message["incoming"]    = row["incoming];
            //message["text"]        = row["text];
            //message["opened"]    = true;
            //message["userid"] = uid;

            var message = result.rows[i];
            message.opened = true;
            message.userid = uid;
            message.id = message.id.toString();
            message.companionid = message.companionid.toString();

            messages.push(message);
          }
          cb(null, messages);
        } else {
          cb(null, null);
        }
      });
    },//////////////////////////////////////////////////////////////////////////////
    function(messages, cb) { // Получаем все непрочитанные сообщения
      //var query = "select * FROM user_new_messages where userid = ? and companionid in (" + fields + ")";
      messages = messages || [];
      var query = qBuilder.build(qBuilder.Q_SELECT, [qBuilder.ALL_FIELDS], C.T_USERNEWMESSAGES,
                                        ["userid", "companionid"], [1, companions.length]);

      self.client.execute(query, params, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
        var newMessages = [];

        var rowsLen = result.rows.length;
        if(rowsLen > 0) {
          for(i = 0; i < rowsLen; i++) {
            //var row = result.rows[i];
            //
            //var message = {};
            //message["id]           = row["id].toString();
            //message["date]         = row["date];
            //message["companionid]  = row["companionid].toString();
            //message["companionvid] = row["companionvid];
            //message["incoming]     = row["incoming];
            //message["text]         = row["text];
            //message["opened]       = false;
            //message["userid]       = uid;

            var message = result.rows[i];
            message.opened = false;
            message.userid = uid;
            message.id = message.id.toString();
            message.companionid = message.companionid.toString();

            newMessages.push(message);
          }

          var i, j;
          var len = messages.length;
          var newMesLen = newMessages.length;
          for(i = 0; i < newMesLen; i++) {
            var noSuch = true;
            for(j = 0; j < len; j++) {
              if(newMessages[i]["id"] == messages[j]["id"]) {
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
                          ["userid", "companionid"], [1, companions.length]);

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
  //var f = C.IO.FIELDS;

  var query = qBuilder.build(qBuilder.Q_UPDATE, ["isnew"], C.T_USERCHATS,
    ["userid", "companionid"], [1, 1]);
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

