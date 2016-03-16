var constants = require('../constants');
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

  var f = constants.IO.FIELDS;

  var fields = [f.giftid, f.type, f.data, f.date, f.fromid, f.fromvid];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, constants.T_USERGIFTS, [f.userid], [1]);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var gifts = [];

    var rowsLen = result.rows.length;
    var i;
    if(rowsLen > 0) {
      var userList = [];
      var const_fields = 0;
      for(i = 0; i < rowsLen; i++) {
        var row = result.rows[i];

        var gift = {};
        gift[f.giftid]  = row[f.giftid].toString();
        gift[f.type]    = row[f.type];
        gift[f.data]    = row[f.data];
        gift[f.date]    = row[f.date];
        gift[f.fromid]  = row[f.fromid].toString();
        gift[f.fromvid] = row[f.fromvid].toString();

        gifts.push(gift);
        if(userList.indexOf(row.fromid) < 0) {
          const_fields ++;
          userList.push(row.fromid);
        }
      }

      var fields = [f.id, f.vid, f.sex, f.city, f.country, f.points];
      var query = qBuilder.build(qBuilder.Q_SELECT, fields, [f.id], [const_fields]);

      self.client.execute(query, userList, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var users = [];
        rowsLen = result.rows.length;
        for(i = 0; i < rowsLen; i++) {
          var row = result.rows[i];

          var user = {};
          user[f.id]      = row[f.id].toString();
          user[f.vid]     = row[f.vid];
          user[f.age]     = row[f.age];
          user[f.sex]     = row[f.sex];
          user[f.city]    = row[f.city];
          user[f.country] = row[f.country];
          user[f.points]  = row[f.points];

          users.push(user);
        }

        var giftsLen = gifts.length;
        var usersLen = users.length;
        for(i = 0; i < giftsLen; i++) {
          for(var j = 0; j < usersLen; j++) {
            if(users[j][f.id] == gifts[i][f.fromid]) {
              if (!users[j].gifts) users[j].gifts = [];

              var gift = {};
              gift[f.id]   = gifts[i].giftid;
              gift[f.type] = gifts[i].type;
              gift[f.data] = gifts[i].data;
              gift[f.date] = gifts[i].date;

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