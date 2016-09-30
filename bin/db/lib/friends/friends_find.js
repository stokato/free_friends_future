var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
/*
 Найти друзей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными друзей (если ничгео нет - NULL)
 */
module.exports = function(uid, friendsID, callback) {
  var self = this;
  if (!uid) { return callback(new Error("Задан пустой Id"), null); }

  var constFields = ["userid"];
  var constCount = [1];
  var params = [uid];

  if(friendsID) {
    constFields.push("friendid");
    constCount.push(friendsID.length);

    for(var i = 0; i < friendsID.length; i++) {
      params.push(friendsID[i]);
    }
  }

  var fields = ["friendid", "friendvid", "date"];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERFRIENDS, constFields, constCount);

  // Отбираем всех друзей
  cdb.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var friends = [];
    var friend = null;
    var friendList = [];
    var constValues = 0;

    if(result.rows.length > 0) {
      var i, rowsLen = result.rows.length;
      constValues = rowsLen;

      for(i = 0; i < rowsLen; i++) {
        var row = result.rows[i];

        friend = {
          id    : row["friendid"].toString(),
          vid   : row["friendvid"],
          date  : row["date"]
        };

        friends.push(friend);
        friendList.push(friend["id"].toString());
      }

      // Отбираем сведения по всем друзьям
      var fields = ["id", "vid", "age", "sex", "city", "country", "points"];
      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, ["id"], [constValues]);

      cdb.client.execute(query, friendList, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        for(var i = 0; i < result.rows.length; i++) {
          var row = result.rows[i];
          var index, j;
          var friendsLen = friendList.length;
          for(j = 0; j < friendsLen; j++) {
            if(friendList[j] == row["id"].toString()) {
              index = j;
            }
          }
          friends[index]["age"]     = row["age"];
          friends[index]["sex"]     = row["sex"];
          friends[index]["city"]    = row["city"];
          friends[index]["country"] = row["country"];
          friends[index]["points"]  = row["points"];
        }

        callback(null, friends);
      });

    } else { return callback(null, null); }
  });
};