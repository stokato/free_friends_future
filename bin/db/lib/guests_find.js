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

  var f = C.IO.FIELDS;

  if (!uid ) { return callback(new Error("Задан пустой Id"), null); }

  var fields = [f.guestid, f.guestvid, f.date];
  //var query = "select guestid, guestvid, date FROM user_guests where userid = ?";
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERGUESTS, [f.userid], [1]);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var guests = [];
    var guest = null;
    var guestList = [];
    var i, rowsLen = result.rows.length;

    if(rowsLen > 0) {
      var row;
      for(i = 0; i < rowsLen; i++) {
        row = result.rows[i];

        guest = {};
        guest[f.guestid]      = row[f.guestid].toString();
        guest[f.guestvid]     = row[f.guestvid];
        guest[f.date]         = row[f.date];

        guests.push(guest);
        guestList.push(guest[f.guestid]);
      }

      var fields = [f.id, f.vid, f.age, f.sex, f.city, f.country, f.points];
      //var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";
      var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERS, [f.id], [rowsLen]);

      self.client.execute(query, guestList, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        rowsLen = result.rows.length;
        for(var i = 0; i < rowsLen; i++) {
          var row = result.rows[i];
          var index, j, guestLen = guestList.length;
          for(j = 0; j < guestLen; j++) {
            if(guestList[j] == row[f.id]) {
              index = j;
            }
          }
          guests[index][f.age]     = row[f.age];
          guests[index][f.sex]     = row[f.sex];
          guests[index][f.city]    = row[f.city];
          guests[index][f.country] = row[f.country];
          guests[index][f.points]  = row[f.points];
        }
        callback(null, guests);
      });

    } else { return callback(null, null); }
  });
};