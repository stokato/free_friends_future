var C = require('../constants');
var buildQuery = require('./build_query');
/*
 Добавить друга в БД: ИД, объект с данными друга
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, friend, callback) { friend = friend || {};
  var f = C.IO.FIELDS;

  if ( !uid || !friend[f.friendid] || !friend[f.friendvid]) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  var fields = [f.userid, f.friendid, f.friendvid, f.date];
  var query = buildQuery.build(buildQuery.Q_INSERT, fields, C.T_USERFRIENDS);

  var params = [uid, friend[f.friendid], friend[f.friendvid], friend[f.date]];
  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, friend);
  });
};

