var C = require('../constants');
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

  var f = C.IO.FIELDS;

  var fields = [f.giftid, f.type, f.data, f.date, f.title, f.fromid, f.fromvid];
  var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERGIFTS, [f.userid], [1]);

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
        gift[f.giftid]  = row[f.giftid].toString();
        gift[f.type]     = row[f.type];
        gift[f.data]     = row[f.data];
        gift[f.date]     = row[f.date];
        gift[f.title]    = row[f.title];
        gift[f.fromid]  = row[f.fromid].toString();
        gift[f.fromvid] = row[f.fromvid].toString();

        gifts.push(gift);
        if(userList.indexOf(gift[f.fromid]) < 0) {
          const_fields ++;
          userList.push(gift[f.fromid]);
        }
      }

// Фейковые подарки/////////////////////////////////////////////
      for(i = 0; i < 10; i++) {
        gift = {};
        gift[f.giftid]  = "payBall";
        gift[f.type] = "Отдых";
        gift[f.data] = "./assets/image/gifts/breath/ball.png";
        gift[f.date] = new Date();
        gift[f.title] = "Мяч";
        gift[f.fromid] = "1cccf8c7-7979-46ac-beca-63b8fa89ab98";
        gift[f.fromvid] = "241631532";
        gifts.push(gift);

	      gift = {};
        gift[f.giftid]  = "paySportcar";
        gift[f.type] = "Обычные";
        gift[f.data] = "./assets/image/gifts/common/sportcar.png";
        gift[f.date] = new Date();
        gift[f.title] = "Машина";
        gift[f.fromid] = "23211d9c-8461-4d96-8c2b-92cfa71d87ef";
        gift[f.fromvid] = "125357763";
        gifts.push(gift);
      }
      userList.push("3499220e-823d-4248-bd85-e244d76ef757");
      const_fields ++;
      userList.push("23211d9c-8461-4d96-8c2b-92cfa71d87ef");
      const_fields ++;

///////////////////////////////////////////////////

      var fields = [f.id, f.vid, f.sex, f.city, f.country, f.points];
      var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERS, [f.id], [const_fields]);

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
        var j, usersLen = users.length;
        for(i = 0; i < giftsLen; i++) {
          for(j = 0; j < usersLen; j++) {
            if(users[j][f.id] == gifts[i][f.fromid]) {
              if (!users[j].gifts) { users[j].gifts = []; }

              var gift = {};
              gift[f.giftid] = gifts[i][f.giftid];
              gift[f.type]    = gifts[i][f.type];
              gift[f.title]   = gifts[i][f.title];
              gift[f.src]    = gifts[i][f.data];
              gift[f.date]    = gifts[i][f.date];

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