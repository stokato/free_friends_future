var constants = require('../constants');
var buildQuery = require('./build_query');
/*
 Найти друзей пользователя: ИД игрока
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив объектв с данными друзей (если ничгео нет - NULL)
 */
module.exports = function(uid, callback) {
  var self = this;
  if (!uid) { return callback(new Error("Задан пустой Id"), null); }

  var f = constants.IO.FIELDS;
  var fields = [f.friendid, f.friendvid, f.date];
  query = buildQuery.build(buildQuery.Q_SELECT, fields, constants.T_USERFRIENDS, [f.userid], [1]);

  self.client.execute(query,[uid], {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    var friends = [];
    var friend = null;
    var friendList = [];
    var const_fields = 0;

    if(result.rows.length > 0) {
      var i = null;
      var rowsLen = result.rows.length;
      const_fields = rowsLen;

      for(i = 0; i < rowsLen; i++) {
        var row = result.rows[i];

        friend = {};
        friend[f.id] = row[f.friendid].toString();
        friend[f.vid] = row[f.friendvid];
        friend[f.date] = row[f.date];

        friends.push(friend);
        friendList.push(row[f.friendid]);
      }

      var fields = [f.id, f.vid, f.age, f.sex, f.city, f.country, f.points];
      var query = buildQuery.build(buildQuery.Q_SELECT, fields, constants.T_USERS, [f.id], [const_fields])

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
          friends[index][f.age]     = row[f.age];
          friends[index][f.sex]     = row[f.sex];
          friends[index][f.city]    = row[f.city];
          friends[index][f.country] = row[f.country];
          friends[index][f.points]  = row[f.points];
        }

        callback(null, friends);
      });

    } else { return callback(null, null); }
  });
};