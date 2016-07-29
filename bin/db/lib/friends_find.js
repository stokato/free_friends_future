var C = require('../constants');
var buildQuery = require('./build_query');
/*
 Найти друзей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными друзей (если ничгео нет - NULL)
 */
module.exports = function(uid, fid, callback) {
  var self = this;
  if (!uid) { return callback(new Error("Задан пустой Id"), null); }

  //var f = C.IO.FIELDS;

  var constFields = ["userid"];
  var constCount = [1];
  var params = [uid];

  if(fid) {
    constFields.push("friendid");
    constCount.push(1);
    params.push(fid);
  }


  var fields = ["friendid", "friendvid", "date"];
  var query = buildQuery.build(buildQuery.Q_SELECT, fields, C.T_USERFRIENDS, constFields, constCount);

  self.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var friends = [];
    var friend = null;
    var friendList = [];
    var const_fields = 0;

    if(result.rows.length > 0) {
      var i, rowsLen = result.rows.length;
      const_fields = rowsLen;

      for(i = 0; i < rowsLen; i++) {
        var row = result.rows[i];

        friend = {};
        friend["id"] = row["friendid"].toString();
        friend["vid"] = row["friendvid"];
        friend["date"] = row["date"];


        friends.push(friend);
        friendList.push(friend["id"]);
      }

      var fields = ["id", "vid", "age", "sex", "city", "country", "points"]; // "id", "vid",
      var query = buildQuery.build(buildQuery.Q_SELECT, fields, C.T_USERS, ["id"], [const_fields]);

      self.client.execute(query, friendList, {prepare: true }, function(err, result) {
        if (err) { return callback(err, null); }

        var i, rowsLen = result.rows.length;
        for(i = 0; i < rowsLen; i++) {
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