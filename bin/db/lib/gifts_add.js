var constants = require('../../constants');
var cdb = require('./../../cassandra_db');
/*
 Добавить подарок: ИД игрока и объект с данными о подарке
 - Провека: все поля
 - Генерируем ИД подарка
 - Строим и выполняем запрос
 - Возвращаем объект подарка
 */
module.exports = function(uid, options, callback) { options = options || {};
  //var f = C.IO.FIELDS;

  if (!uid) { return callback(new Error("Не указан Id пользователя"), null); }

  if (!options["giftid"] || !options["src"] || !options["date"] || !options["fromid"]
    || !options["fromvid"]) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  var id = cdb.uuid.random();

  var fields = ["id", "userid", "giftid", "type", "src", "date", "title", "fromid", "fromvid"];
  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERGIFTS);

  var params = [];
  params.push(id);
  params.push(uid);
  params.push(options["giftid"]);
  params.push(options["type"]);
  params.push(options["src"]);
  params.push(options["date"]);
  params.push(options["title"]);
  params.push(options["fromid"]);
  params.push(options["fromvid"]);

  cdb.client.execute(query, params, { prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options.gid = id.toString();

    callback(null, options);
  });
};