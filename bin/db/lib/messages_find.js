var async = require('async');

var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  var self = this;

  var companions = options.id_list || [];
  var firstDate =  options["first_date"];
  var secondDate = options["second_date"];

  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
  if (!companions[0]) { return callback(new Error("Задан пустой Id собеседника"), null); }

  var fields = "";
  var params = [uid];

  for(var i = 0; i < companions.length; i++) {
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

      var constFields = ["userid", "companionid"];
      var constValues = [1, companions.length];

      var query = qBuilder.build(qBuilder.Q_SELECT, [qBuilder.ALL_FIELDS], C.T_USERMESSAGES, constFields, constValues,
                                                                                                const_more, const_less);

      self.client.execute(query, params2, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
        var messages = [];

        if(result.rows.length > 0) {
          for(var i = 0; i < result.rows.length; i++) {

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

      var constFields = ["userid", "companionid"];
      var constValues = [1, companions.length];

      var query = qBuilder.build(qBuilder.Q_SELECT, [qBuilder.ALL_FIELDS], C.T_USERNEWMESSAGES, constFields, constValues);

      self.client.execute(query, params, {prepare: true }, function(err, result) {
        if (err) { return cb(err, null); }
        var newMessages = [];

        if(result.rows.length > 0) {
          for(i = 0; i < result.rows.length; i++) {
            var message = result.rows[i];
            message.opened = false;
            message.userid = uid;
            message.id = message.id.toString();
            message.companionid = message.companionid.toString();

            newMessages.push(message);
          }

          // Сливаем в один массив
          for(var i = 0; i < newMessages.length; i++) {
            var noSuch = true;
            for(var j = 0; j < messages.length; j++) {
              if(newMessages[i].id == messages[j].id) {
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
    function(messages, cb) { // Удаляем сообщения из таблицы новых
      var constFields = ["userid", "companionid"];
      var constValues = [1, companions.length];

      //var query = "DELETE FROM user_new_messages WHERE userid = ? and companionid in ( " + fields + " )";
      var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERNEWMESSAGES, constFields, constValues);

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

function updateChat(db, uid, companions, count, callback) { // Сбрасываем в чатах флаг - есть новые
  //var query = "update user_chats set isnew = ? where userid = ? and companionid = ?";
  //var f = C.IO.FIELDS;

  var fields = ["isnew"];
  var constFields = ["userid", "companionid"];
  var constValues = [1, 1];

  var query = qBuilder.build(qBuilder.Q_UPDATE, fields, C.T_USERCHATS, constFields, constValues);
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

