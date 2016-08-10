var async = require('async');

var C = require('../constants');
var qBuilder = require('./build_query');
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
      var fields = ["companionid", "isnew"];
      var const_fields = ["userid"];
      var const_values = [1];

      var query = qBuilder.build(qBuilder.Q_SELECT, fields, C.T_USERCHATS,
                                                                  const_fields,const_values);

      self.client.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        if (result.rows.length == 0) return cb(null, null, null, null);

        var rows = result.rows;
        var const_fields = rows.length;

        var companions = [];
        var newMessages = {};

        for (var i = 0; i < rows.length; i++) {
          companions.push(rows[i]["companionid"].toString());
          newMessages[rows[i]["companionid"].toString()] = rows[i]["isnew"];
        }

        cb(null, const_fields, companions, newMessages);
      });
    },////////////////////////////////////////////////////////////////////
    function (const_fields, companions, newMessages, cb) {
      if(!companions) { return cb(null, null, null, null); }

      var query = qBuilder.build(qBuilder.Q_SELECT, ["id", "vid", "age", "sex", "city", "country", "points"], C.T_USERS,
                                                                              ["id"], [const_fields]);

      self.client.execute(query, companions, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        var users = [];
        for (var i = 0; i < result.rows.length; i++) {
          //var row = result.rows[i];
          //var user = {};
          //user["id"]        = row[f.id].toString();
          //user["vid"]       = row[f.vid];
          //user[f.age]       = row[f.age];
          //user[f.sex]       = row[f.sex];
          //user[f.city]      = row[f.city];
          //user[f.country]   = row[f.country];
          //user[f.points]    = row[f.points];
          //user[f.isnew]     = newMessages[row[f.id].toString()];

          var user = result.rows[i];
          user.id = user.id.toString();
          user.isnew = newMessages[user.id];

          users.push(user);
        }

        cb(null, users);
      });
    } ////////////////////////////////////////////////////////////////////////////
  ], function(err, users) {
    if(err) { return callback(err, null) }

    callback(null, users);
  });
};