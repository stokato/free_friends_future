var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF  = require('./../../constants').PFIELDS;

/*
 Найти сохраненные сообщения пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }

  var date = options[PF.DATE];
  var params = [uid];

  var fields = ["companionid"];
  var constFields = ["userid"];
  var constValues = [1];

  // Получаем чаты
  //var query = "select companionid FROM user_chats where userid = ?";
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERCHATS, constFields, constValues);

  cdb.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, null);

    var i, companions = result.rows;
    var compLen = companions.length;
    for(i = 0; i< compLen; i++) {
      params.push(companions[i]["companionid"]);
    }

    var const_more = null;
    if (date) {
      const_more = "id";
      params.push(cdb.timeUuid.fromDate(date));
    }

    // Отбираем сообщения
    var fields = ["id", "date", "companionid", "companionvid", "incoming", "text", "opened"];
    var constFields = ["userid", "companionid"];
    var constValues = [1, compLen];

    //query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";

    query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERMESSAGES,  constFields , constValues, const_more);

    cdb.client.execute(query, params, {prepare: true }, function(err, result) {
      if (err) { return callback(err, null); }
      var messages = [];

      if(result.rows.length > 0) {
        for(var i = 0; i < result.rows.length; i++) {

          var message = result.rows[i];
          message.id = message.id.toString();
          message.companionid = message.companionid.toString();

          messages.push(message);
        }

        // Получаем данные об отправителях
        //var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";
        var fields = ["id", "vid", "age", "sex", "country", "points"];
        var constFields = ["id"];
        var constValues = [compLen];

        var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, constFields, constValues);

        params = [];

        for(i = 0; i< companions.length; i++) {
          params.push(companions[i]["companionid"]);
        }

        cdb.client.execute(query, params, {prepare: true }, function(err, result) {
          if (err) { return callback(err, null); }

          // Разносим сообщения по чатам
          var users = [];
          var rowsLen = result.rows.length;
          for(i = 0; i < rowsLen; i++) {

            var user = result.rows[i];
            user.id = user.id.toString();
            user.points = user.points || 0;

            users.push(user);
          }


          for(var i = 0; i < messages.length; i++) {
            for(var j = 0; j < users.length; j++) {
              if(users[j]["id"] == messages[i]["companionid"]) {
                if (!users[j].messages) users[j].messages = [];
                if (messages[i]["opened"] == false) users[j]["opened"] = true;

                var message = {};
                message["id"]        = messages[i]["id"];
                message["companionid"] = messages[i]["companionid"];
                message["opened"]    = messages[i]["opened"];
                message["text"]        = messages[i]["text"];
                message["date"]        = messages[i]["date"];

                users[j].messages.push(message);
              }
            }
          }
          callback(null, users);
        });
      } else {
        callback(null, null);
      }
    });
  });
};