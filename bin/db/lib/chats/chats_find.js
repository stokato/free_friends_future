var async = require('async');

var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Найти пользователей, с которыми были чаты, показать наличине новых сообщений
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с пользователями (если ничего нет null)
 */
module.exports = function(uid, callback) {

  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }

  async.waterfall([ //////////////////////////////////////////////////////////
    function (cb) {  // Получаем список чатов
      var params = [uid];
      var fields = ["companionid", "isnew"];
      var const_fields = ["userid"];
      var const_values = [1];

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERCHATS, const_fields, const_values);

      cdb.client.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        if (result.rows.length == 0) return cb(null, null, null, null);

        var rows = result.rows;
        var const_values = rows.length;

        var companions = [];
        var newMessages = {};

        for (var i = 0; i < rows.length; i++) {
          companions.push(rows[i].companionid.toString());
          newMessages[rows[i].companionid.toString()] = rows[i].isnew;
        }

        cb(null, const_values, companions, newMessages);
      });
    },////////////////////////////////////////////////////////////////////
    function (const_values, companions, newMessages, cb) { // Разбиваем чаты по пользователям
      if(!companions) { return cb(null, null, null, null); }

      var fields = ["id", "vid", "age", "sex", "city", "country", "points"];
      var const_fields = ["id"];

      var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, fields, constants.T_USERS, const_fields, [const_values]);

      cdb.client.execute(query, companions, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        var users = [];
        for (var i = 0; i < result.rows.length; i++) {

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