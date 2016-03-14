var async = require('async');
/*
 Найти пользователей, с которыми были чаты, показать наличине новых сообщений
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с пользователями (если ничего нет null)
 */
module.exports = function(uid, callback) {
  var self = this;
  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  async.waterfall([ //////////////////////////////////////////////////////////
    function (cb) {
      var params = [uid];
      var query = "select companionid, isnew FROM user_chats where userid = ?";

      self.client.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        if (result.rows.length == 0) return cb(null, null, null);

        var fields = "?";
        var rows = result.rows;
        var companions = [];
        var newMessages = {};

        companions.push(rows[0].companionid);
        newMessages[rows[0].companionid.toString()] = rows[0].isnew;
        for (var i = 1; i < rows.length; i++) {
          companions.push(rows[i].companionid);
          newMessages[rows[i].companionid.toString()] = rows[i].isnew;
          fields = fields + ", ?";
        }

        cb(null, fields, companions, newMessages);
      });
    },////////////////////////////////////////////////////////////////////
    function (fields, companions, newMessages, cb) {
      if(!companions) { return cb(null, null, null, null); }
      var query = "select * FROM users where id in (" + fields + ")";

      self.client.execute(query, companions, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        var users = [];
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows[i];
          var user = {
            id: row.id.toString(),
            vid: row.vid,
            age: row.age,
            sex: row.sex,
            city: row.city,
            country: row.country,
            points: row.points,
            isnew: newMessages[row.id.toString()]
          };
          users.push(user);
        }

        cb(null, users);
      });
    }
  ], function(err, users) {
    if(err) { return callback(err, null) }

    callback(null, users);
  });
};