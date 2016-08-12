var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Добавить гостя в БД: ИД, объект с данными гостя
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, options, callback) { options = options || {};

  if ( !uid || !options.guestid || !options.date || !options.guestvid) {
    return callback(new Error("Не указан Id пользователя или его гостя, либо дата"), null);
  }

  var fields = ["userid", "guestid", "guestvid", "date"];
  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERGUESTS);

  var params = [uid, options.guestid, options.guestvid, options.date ];

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};