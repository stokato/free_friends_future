var async = require('async');

var constants = require('../constants');
var buildQuery = require('./build_query');
/*
 Найти пользователей, с которыми были чаты, показать наличине новых сообщений
 - Проверка ИД
 - Строим запрос (все поля) и выполняем
 - Возвращаем массив с пользователями (если ничего нет null)
 */
module.exports = function(uid, callback) {
  var self = this;
  var f = constants.IO.FIELDS;

  if (!uid) {
    return callback(new Error("Задан пустой Id пользователя"), null);
  }
  async.waterfall([ //////////////////////////////////////////////////////////
    function (cb) {
      var params = [uid];
      var fields = [f.companionid, f.isnew];
      var const_fields = [f.userid];
      var const_values = [1];

      var query = buildQuery.build(buildQuery.Q_SELECT, fields, constants.T_USERGUESTS,
                                                                  const_fields,const_values);

      self.client.execute(query, params, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        if (result.rows.length == 0) return cb(null, null, null);

        var rows = result.rows;
        var const_fields = rows.length;

        var companions = [];
        var newMessages = {};

        for (var i = 0; i < rows.length; i++) {
          companions.push(rows[i].companionid);
          newMessages[rows[i].companionid.toString()] = rows[i].isnew;
        }

        cb(null, const_fields, companions, newMessages);
      });
    },////////////////////////////////////////////////////////////////////
    function (const_fields, companions, newMessages, cb) {
      if(!companions) { return cb(null, null, null, null); }

      var query = buildQuery(buildQuery.Q_SELECT, [buildQuery.ALL_FIELDS], companions.T_USERS,
                                                                              [f.id], const_fields);

      self.client.execute(query, companions, {prepare: true}, function (err, result) {
        if (err) { return cb(err, null); }

        var users = [];
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows[i];
          var user = {};
          user[f.id]       = row[f.id].toString();
          user[f.vid]      = row[f.vid];
          user[f.age]      = row[f.age];
          user[f.sex]      = row[f.sex];
          user[f.city]     = row[f.city];
          user[f.country]  = row[f.country];
          user[f.points]   = row[f.points];
          user[f.isnew]    = newMessages[row[f.id].toString()];

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