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
  async.waterfall([
    function (cb) {//////////////////////////////////////////////////////////
      var params = [uid];

      var query = "select companionid FROM user_chats where userid = ?";

      self.client.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        if (result.rows.length == 0) return cb(null, null, null);

        var fields = "?";
        var rows = result.rows;
        var companions = [];
        companions.push(rows[0].companionid);
        for (var i = 1; i < rows.length; i++) {
          companions.push(rows[i].companionid);
          fields = fields + ", ?";
        }
        cb(null, fields, companions);
      });
    },////////////////////////////////////////////////////////////////////
    function (fields, companions, cb) {
      if(!companions) { return cb(null, null, null, null); }
      var query = "select * FROM users where id in (" + fields + ")";

      self.client.execute(query, companions, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        var users = [];
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows[i];
          var user = {
            id: row.id,
            vid: row.vid,
            age: row.age,
            sex: row.sex,
            city: row.city,
            country: row.country,
            points: row.points,
            isnew: false
          };
          users.push(user);
        }
        cb(null, users, companions, fields);
      });
    },////////////////////////////////////////////////////////////////////////////
    function (users, params, fields, cb) {
      if(!users) { return cb(null, null) }
      params.unshift(uid);
      var query = "select * FROM user_new_messages where userid = ? and companionid in (" + fields + ")";

      self.client.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        if (result.rows.length > 0) {
          var rows = result.rows;
          for (var i = 0; i < users.length; i++) {
            for (var j = 0; j < rows.length; j++) {
              if (users[i].id.toString() == rows[j].companionid.toString())
                users[i].isnew = true;
            }
          }
          cb(null, users);
        } else callback(null, users);
      });
    }
  ], function(err, users) {
    if(err) { return callback(err, null) }

    callback(null, users);
  });
};