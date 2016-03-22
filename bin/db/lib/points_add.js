var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Добавить очки игрока в БД: объект с ид, вид и количеством очков
 - Проверка (все поля обязательны)
 - Определяем сотню
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options    = options || {};
  var self = this;
  var f = C.IO.FIELDS;

  if ( !options[f.userid] || !options[f.uservid] || !options[f.points]) {
    return callback(new Error("Не указан ИД, ВИД или количество очков игрока"), null);
  }

  var hundred = Math.floor(options[f.points]/100) * 100 + 100;

  var fields = [f.hundreds, f.points, f.userid, f.uservid];
  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERPOINTS);

  var params = [hundred, options[f.points], options[f.userid], options[f.uservid]];

  self.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    var query = qBuilder.build(qBuilder.Q_INSERT, [f.id, f.hundred], C.T_MAX_HANDRED);
    self.client.execute(query, ["max", hundred],{prepare: true },  function(err) {
      if (err) {  return callback(err); }

      callback(null, options);
    });
  });
};