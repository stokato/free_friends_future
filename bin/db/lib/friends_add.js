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
  //var f = C.IO.FIELDS;

  if ( !uid || !friend["friendid"] || !friend["friendvid"]) {
    return callback(new Error("Не указан Id пользователя или его друга"), null);
  }

  var fields = ["userid", "friendid", "friendvid", "date"];
  var query = buildQuery.build(buildQuery.Q_INSERT, fields, C.T_USERFRIENDS);

  var params = [uid, friend["friendid"], friend["friendvid"], friend["date"]];
  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, friend);
  });
};


