var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Найти сохраненные сообщения пользователя, связаныне с заданным собеседником: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  var companion = options.id;
  var firstDate =  options["first_date"];
  var secondDate = options["second_date"];
  
  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }
  if (!companion) { return callback(new Error("Задан пустой Id собеседника"), null); }
  
  var params = [uid, companion];
  
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
      var constValues = [1, 1];
      
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
      var constValues = [1, 1];
      
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
      var constValues = [1, 1];
      
      //var query = "DELETE FROM user_new_messages WHERE userid = ? and companionid in ( " + fields + " )";
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_DELETE, [], constants.T_USERNEWMESSAGES, constFields, constValues);
      
      cdb.client.execute(query, params, {prepare: true }, function(err) {
        if (err) {  return cb(err, null); }
        
        cb(null, messages);
      });
    },////////////////////////////////////////////////////////////////////////////////
    function(messages, cb) {
  
      var fields = ["isnew"];
      var constFields = ["userid", "companionid"];
      var constValues = [1, 1];
  
      // Сбрасываем в чатах флаг - есть новые
      //var query = "update user_chats set isnew = ? where userid = ? and companionid = ?";
      
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, constants.T_USERCHATS, constFields, constValues);
      var params = [false, uid, companion];
      
      cdb.client.execute(query, params, {prepare: true },  function(err) {
        if (err) {  return callback(err, null); }
    
    
        cb(null, messages);
    
      });
    },//////////////////////////////////////////////////////////////////////////////////
    function (messages, cb) { // Отбираем сведения по обоим собеседникам
      // Отбираем сведения по всем друзьям
      var fields = ["id", "vid", "age", "sex", "city", "country"];
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, ["id"], [2]);
  
      cdb.client.execute(query, [uid, companion], {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }
    
        var i, selfInfo, compInfo;
        
        for(i = 0; i < result.rows.length; i++) {
          var info = result.rows[i];
          if(info["id"] == uid) {
            selfInfo = info;
          } else if(info["id"] == companion) {
            compInfo = info["id"];
          }
        }
        
        if(!selfInfo || !compInfo) {
          cb("Не удалось найти сведения об одном из собеседников");
        }
        
        var message, complMessages = [];
        
        selfInfo.id = selfInfo.id.toString();
        compInfo.id = compInfo.id.toString();
        
        for(i = 0; i < messages.length; i++) {
          message = {};
          if(messages[i].incoming) { // Если входящее, берем данные собеседника и наоборот
            message.id      = compInfo.id;
            message.vid     = compInfo.vid;
            message.city    = compInfo.city;
            message.country = compInfo.country;
            message.sex     = compInfo.sex;
          } else {
            message.id      = selfInfo.pID;
            message.vid     = selfInfo.pVID;
            message.city    = selfInfo.pCity;
            message.country = selfInfo.pCountry;
            message.sex     = selfInfo.pSex;
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


