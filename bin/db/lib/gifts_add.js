var C = require('../constants');
var buildQuery = require('./build_query');
/*
 Добавить подарок: ИД игрока и объект с данными о подарке
 - Провека: все поля
 - Генерируем ИД подарка
 - Строим и выполняем запрос
 - Возвращаем объект подарка
 */
module.exports = function(uid, options, callback) { options = options || {};
  var f = C.IO.FIELDS;

  if (!uid) { return callback(new Error("Не указан Id пользователя"), null); }

  if (!options[f.name] || !options[f.src] || !options[f.date] || !options[f.fromid]
    || !options[f.fromvid]) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  var id = this.uuid.random();

  var fields = [f.id, f.userid, f.giftid, f.type, f.data, f.date, f.fromid, f.fromvid];
  var query = buildQuery.build(buildQuery.Q_INSERT, fields, C.T_USERGIFTS);

  var params = [];
  params.push(id);
  params.push(uid);
  params.push(options[f.id]);
  params.push(options[f.name]);
  params.push(options[f.src]);
  params.push(options[f.date]);
  params.push(options[f.fromid]);
  params.push(options[f.fromvid]);

  this.client.execute(query, params, { prepare: true },  function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};