var constants = require('../constants');
var qBuilder = require('./build_query');
/*
 Добавить гостя в БД: ИД, объект с данными гостя
 - Проверка (все поля обязательны)
 - Генерируем ИД
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(uid, options, callback) { options = options || {};
  var f = constants.IO.FIELDS;

  if ( !uid || !options[f.id] || !options[f.date] || !options[f.vid]) {
    return callback(new Error("Не указан Id пользователя или его гостя"), null);
  }

  var fields = [f.userid, f.guestid, f.guestvid, f.date];
  var query = qBuilder.build(qBuilder.Q_INSERT, fields, constants.T_USERGUESTS);

  var params = [uid, options[f.id], options[f.vid], options[f.date] ];

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};