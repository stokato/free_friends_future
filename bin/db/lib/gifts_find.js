var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Найти все подарки игрока: ИД игрока
 - Проверка на ИД
 - Строим и выполняем запрос (все поля)
 - Возвращаем массив с подарками (если ничего нет NULL)
 */
module.exports = function(uid, callback) {
  var self = this;
  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null);}

  //var f = C.IO.FIELDS;

  var fields = ["giftid", "type", "src", "date", "title", "fromid", "fromvid"];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERGIFTS, ["userid"], [1]);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var gifts = [];

    var rowsLen = result.rows.length;
    var i;
    if(rowsLen > 0 || true) {
      var userList = [];
      var const_fields = 0;
      for(i = 0; i < rowsLen; i++) {
        var row = result.rows[i];

        var gift = {};
        gift["giftid"]   = row["giftid"].toString();
        gift["type"]     = row["type"];
        gift["src"]      = row["src"];
        gift["date"]     = row["date"];
        gift["title"]    = row["title"];
        gift["fromid"]   = row["fromid"].toString();
        gift["fromvid"]  = row["fromvid"].toString();

        gifts.push(gift);
        if(userList.indexOf(gift["fromid"]) < 0) {
          const_fields ++;
          userList.push(gift["fromid"]);
        }
      }

      var fields = ["id", "vid", "sex", "city", "country", "points"];
      var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERS, ["id"], [const_fields]);

      self.client.execute(query, userList, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var users = [];
        rowsLen = result.rows.length;
        for(i = 0; i < rowsLen; i++) {
          //var row = result.rows[i];

          //var user = {};
          //user[f.id]      = row[f.id].toString();
          //user[f.vid]     = row[f.vid];
          //user[f.age]     = row[f.age];
          //user[f.sex]     = row[f.sex];
          //user[f.city]    = row[f.city];
          //user[f.country] = row[f.country];
          //user[f.points]  = row[f.points];

          var user = result.rows[i];
          user.id = user.id.toString();

          users.push(user);
        }

        var giftsLen = gifts.length;
        var j, usersLen = users.length;
        for(i = 0; i < giftsLen; i++) {
          for(j = 0; j < usersLen; j++) {
            if(users[j]["id"] == gifts[i]["fromid"]) {
              if (!users[j].gifts) { users[j].gifts = []; }

              var gift = {};
              gift["giftid"]  = gifts[i]["giftid"];
              gift["type"]    = gifts[i]["type"];
              gift["title"]   = gifts[i]["title"];
              gift["src"]     = gifts[i]["src"];
              gift["date"]    = gifts[i]["date"];

              users[j].gifts.push(gift);
            }
          }
        }
        callback(null, users);
      });
    } else {
      callback(null, null);
    }
  });
};