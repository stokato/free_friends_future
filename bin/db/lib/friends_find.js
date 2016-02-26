/*
 Найти друзей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными друзей (если ничгео нет - NULL)
 */
module.exports = function(uid, callback) {
  var self = this;
  if (!uid) { return callback(new Error("Задан пустой Id"), null); }

  var query = "select friendid, friendvid, date FROM user_friends where userid = ?";

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var friends = [];
    var friend = null;
    var friendList = [];
    var fields = "";

    if(result.rows.length > 0) {
      var i = null;
      var rowsLen = result.rows.length;
      for(i = 0; i < rowsLen; i++) {
        var row = result.rows[i];
        friend = { id: row.friendid, vid: row.friendvid, date: row.date };
        friends.push(friend);
        friendList.push(row.friendid);
        if(i == 0) { fields = "?"; }
        else { fields = fields + ", ?"; }
      }

      var query = "select id, vid, age, sex, city, country, points FROM users where id in (" + fields + ")";

      self.client.execute(query, friendList, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var i = null;
        var rowsLen = result.rows.length;
        for(i = 0; i < rowsLen; i++) {
          var row = result.rows[i];
          var index, j;
          var friendsLen = friendList.length;
          for(j = 0; j < friendsLen; j++) {
            if(friendList[j].toString() == row.id.toString()) {
              index = j;
            }
          }
          friends[index].age = row.age;
          friends[index].sex = row.sex;
          friends[index].city = row.city;
          friends[index].country = row.country;
          friends[index].points = row.points;
        }

        callback(null, friends);
      });

    } else { return callback(null, null); }
  });
};