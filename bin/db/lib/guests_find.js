var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Найти гостей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными (Если не нашли ничего - NULL)
 */
module.exports = function(uid, callback) {
  var self = this;

  //var f = C.IO.FIELDS;

  if (!uid ) { return callback(new Error("Задан пустой Id"), null); }

  var fields = ["guestid", "guestvid", "date"];
  //var query = "select guestid, guestvid, date FROM user_guests where userid = ?";
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERGUESTS, ["userid"], [1]);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var guests = [];
    //var guest = null;
    var guestList = [];
    var i, rowsLen = result.rows.length;

    if(rowsLen > 0) {
      var row;
      for(i = 0; i < rowsLen; i++) {
        row = result.rows[i];

        var guest = {};
        guest["id"]      = row["guestid"].toString();
        guest["vid"]     = row["guestvid"];
        guest["date"]    = row["date"];

        //var guest = result.rows[i];
        //guest.guestid = guest.guestid.toString();

        guests.push(guest);
        guestList.push(guest["id"]);
      }

      var fields = ["id", "vid", "age", "sex", "city", "country", "points"]; //"id", "vid",
      //var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";
      var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERS, ["id"], [rowsLen]);

      self.client.execute(query, guestList, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        rowsLen = result.rows.length;
        for(var i = 0; i < rowsLen; i++) {
          var row = result.rows[i];
          var index, j, guestLen = guestList.length;
          for(j = 0; j < guestLen; j++) {
            if(guestList[j] == row["id"]) {
              index = j;
            }
          }
          guests[index]["age"]     = row["age"];
          guests[index]["sex"]     = row["sex"];
          guests[index]["city"]    = row["city"];
          guests[index]["country"] = row["country"];
          guests[index]["points"]  = row["points"];
          //guests[index] = row;
        }
        callback(null, guests);
      });

    } else { return callback(null, null); }
  });
};