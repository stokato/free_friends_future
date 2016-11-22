var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF = require('./../../constants').PFIELDS;

/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  var companions = options[PF.ID_LIST] || [];
  var firstDate =  options[PF.DATE_FROM];
  var secondDate = options[PF.DATE_TO];

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
        params2.push(cdb.timeUuid.fromDate(firstDate));
        params2.push(cdb.timeUuid.fromDate(secondDate));
      }

      var constFields = ["userid", "companionid"];
      var constValues = [1, companions.length];

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, [cdb.qBuilder.ALL_FIELDS], constants.T_USERMESSAGES, constFields, constValues,
                                                                                                const_more, const_less);

      cdb.client.execute(query, params2, {prepare: true }, function(err, result) {
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

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, [cdb.qBuilder.ALL_FIELDS], constants.T_USERNEWMESSAGES, constFields, constValues);

      cdb.client.execute(query, params, {prepare: true }, function(err, result) {
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
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_USERNEWMESSAGES, constFields, constValues);

      cdb.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err, null); }

        cb(null, messages);
      });
    },////////////////////////////////////////////////////////////////////////////////
    function(messages, cb) {

      var count = 0;

      updateChat(uid, companions, count, function(err, res) {
        if(err) { return cb(err, null); }

        cb(null, messages);
      });
    },//////////////////////////////////////////////////////////////////////////////////
    function (messages, cb) { // Отбираем сведения по обоим собеседникам
      // Отбираем сведения по всем друзьям
      var fields = ["id", "vid", "age", "sex", "city", "country"];
      var constFields = ["id"];
      var constValues = [companions.length + 1];
    
      var params = [uid];
      for(var i = 0; i < companions.length; i++) {
        params.push(companions[i]);
      }
      
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, constFields, constValues);
      cdb.client.execute(query, params, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }
      
        var i, selfInfo, compInfoList = {}, compInfo;
      
        for(i = 0; i < result.rows.length; i++) {
          var info = result.rows[i];
          info.id = info.id.toString();
          if(info.id == uid) {
            selfInfo = info;
          } else {
            compInfoList[info.id] = info;
          }
        }
      
        if(!selfInfo) {
          return cb("Не удалось найти сведения о целевом пользователе");
        }
      
        var message, complMessages = [];
      
        selfInfo.id = selfInfo.id.toString();
      
        for(i = 0; i < messages.length; i++) {
          message = {};
  
          compInfo = compInfoList[messages[i].companionid];
  
          if(!compInfo) {
            cb("Не удалось найти сведения об одном из собеседников");
          }
          
          if(messages[i].incoming) { // Если входящее, берем данные собеседника и наоборот
            message.id      = compInfo.id;
            message.vid     = compInfo.vid;
            message.city    = compInfo.city;
            message.country = compInfo.country;
            message.sex     = compInfo.sex;
          } else {
            message.id      = selfInfo.id;
            message.vid     = selfInfo.vid;
            message.city    = selfInfo.city;
            message.country = selfInfo.country;
            message.sex     = selfInfo.sex;
          }
          message.chat      = compInfo.id;
          message.chatVID   = compInfo.vid;
          message.date      = messages[i].date;
          message.text      = messages[i].text;
          message.messageid = messages[i].id;
        
          complMessages.push(message);
        }
      
        cb(null, complMessages);
      });
    }
  ], function(err, messages) {
    if(err) return callback(err, null);

    callback(null, messages);
  })
};

function updateChat(uid, companions, count, callback) { // Сбрасываем в чатах флаг - есть новые
  //var query = "update user_chats set isnew = ? where userid = ? and companionid = ?";
  //var f = C.IO.FIELDS;

  var fields = ["isnew"];
  var constFields = ["userid", "companionid"];
  var constValues = [1, 1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, constants.T_USERCHATS, constFields, constValues);
  var params = [false, uid, companions[count]];

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err, null); }

    count++;

    if(count < companions.length) {
      updateChat(uid, companions, count, callback);
    } else {
      callback(null, null);
    }
  });
}

