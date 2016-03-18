var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Удалить очки пользователя
 - Проверка на ИД, количество очков
 - Строим и выполняем запрос на удаление
 - Возвращаем опции обратно
 */
module.exports = function(options, callback) { options = options || {};
  var f = C.IO.FIELDS;
  if (!options[f.userid] || !options[f.points]) {
    return callback(new Error("Задан пустой Id игрока или количество очков"));
  }

  var hundred = Math.floor(options[f.points]/100) * 100 + 100;

  var query = qBuilder.build(qBuilder.Q_DELETE, [], C.T_USERPOINTS,
                                [f.hundreds, f.points, f.userid], [1, 1, 1]);

  var params = [hundred, options[f.points], options[f.userid]];

  this.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};