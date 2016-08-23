var constants = require('../../constants');
var cdb = require('./../../cassandra_db');

/*
 Найти все подарки игрока: ИД игрока
 - Проверка на ИД
 - Строим и выполняем запрос (все поля)
 - Возвращаем массив с подарками (если ничего нет NULL)
 */
module.exports = function(uid, callback) {
  if (!uid) { return callback(new Error("Задан пустой Id пользователя"), null);}

  var fields = ["giftid", "type", "src", "date", "title", "fromid", "fromvid"];
  var constFields = ["userid"];
  var constValues = [1];

  // Отбираем все подарки пользователя
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERGIFTS, constFields, constValues);

  cdb.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var gifts = [];

    var rowsLen = result.rows.length;
    if(rowsLen > 0 || true) {

      var userList = [];
      var constValues = 0;

      for(var i = 0; i < rowsLen; i++) {

        var gift = result.rows[i];
        gift.giftid   = gift.giftid.toString();
        gift.fromid   = gift.fromid.toString();
        gift.fromvid  = gift.fromvid.toString();

        gifts.push(gift);
        if(userList.indexOf(gift.fromid) < 0) {
          constValues ++;
          userList.push(gift.fromid);
        }
      }

      // Отбираем сведения по подарившим
      var fields = ["id", "vid", "sex", "city", "country", "points"];
      var constFields = ["id"];

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, constFields, [constValues]);

      cdb.client.execute(query, userList, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var users = [];

        for(i = 0; i < result.rows.length; i++) {
          var user = result.rows[i];
          user.id = user.id.toString();

          users.push(user);
        }

        // Разбиваем подарки по подарившим
        var giftsLen = gifts.length;
        var j, usersLen = users.length;
        for(i = 0; i < giftsLen; i++) {
          for(j = 0; j < usersLen; j++) {

            if(users[j].id == gifts[i].fromid) {
              if (!users[j].gifts) { users[j].gifts = []; }

              users[j].gifts.push({
                giftid : gifts[i].giftid,
                type   : gifts[i].type,
                title  : gifts[i].title,
                src    : gifts[i].src,
                date   : gifts[i].date
              });
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