var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти сохраненные сообщения пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с сообщениями (если ничего нет - NULL)
 */
module.exports = function(uid, options, callback) { options = options || {};
  var self = this;
  var f = C.IO.FIELDS;

  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null); }

  var date = options[f.date];
  var params = [uid];

  //var query = "select companionid FROM user_chats where userid = ?";
  var query = qBuilder.build(qBuilder.Q_SELECT, [f.companionid], C.T_USERCHATS, [f.userid], [1]);

  self.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) return callback(null, null);

    var i, companions = result.rows;
    var compLen = companions.length;
    for(i = 0; i< compLen; i++) {
      params.push(companions[i][f.companionid]);
    }

    var const_more = null;
    if (date) {
      const_more = f.id;
      params.push(self.timeUuid.fromDate(date));
    }

    //query = "select * FROM user_messages where userid = ? and companionid in (" + fields + ")";
    var const_values = compLen;
    query = qBuilder.build(qBuilder.Q_SELECT, [qBuilder.ALL_FIELDS], C.T_USERMESSAGES,
                          [f.userid, f.companionid] , [1, const_values], const_more);

    self.client.execute(query, params, {prepare: true }, function(err, result) {
      if (err) { return callback(err, null); }
      var messages = [];

      var i, rowsLen = result.rows.length;
      if(rowsLen > 0) {
        for(i = 0; i < rowsLen; i++) {
          var row = result.rows[i];

          var message = {};
          message[f.id] = row[f.id].toString();
          message[f.date] = row[f.date];
          message[f.companionid] = row[f.companionid].toString();
          message[f.companionvid] = row[f.companionvid];
          message[f.incoming] = row[f.incoming];
          message[f.text] = row[f.text];
          message[f.opened] = row[f.opened];

          messages.push(message);
        }

        //var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";
        var fields = [f.id, f.vid, f.age, f.sex, f.country, f.points];
        var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERS, [f.id], [const_values]);

        params = [];

        var compLen = companions.length;
        for(i = 0; i< compLen; i++) {
          params.push(companions[i][f.companionid]);
        }
        self.client.execute(query, params, {prepare: true }, function(err, result) {
          if (err) { return callback(err, null); }

          var users = [];
          var rowsLen = result.rows.length;
          for(i = 0; i < rowsLen; i++) {
            var row = result.rows[i];

            var user = {};
            user[f.id]    = row[f.id].toString();
            user[f.vid]   = row[f.vid];
            user[f.age]     = row[f.age];
            user[f.sex]     = row[f.sex];
            user[f.city]    = row[f.city];
            user[f.country] = row[f.country];
            user[f.points]  = row[f.points] || 0;

            users.push(user);
          }

          var i, j;
          var mesLen = messages.length;
          var userLen = users.length;
          for(i = 0; i < mesLen; i++) {
            for(j = 0; j < userLen; j++) {
              if(users[j][f.id] == messages[i][f.companionid]) {
                if (!users[j].messages) users[j].messages = [];
                if (messages[i][f.opened] == false) users[j][f.opened] = true;

                var message = {};
                message[f.id]        = messages[i][f.id];
                message[f.companionid] = messages[i][f.companionid];
                message[f.opened]    = messages[i][f.opened];
                message[f.text]        = messages[i][f.text];
                message[f.date]        = messages[i][f.date];

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