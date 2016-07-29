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
  //var f = C.IO.FIELDS;

  if (!uid) { return callback(new Error("Не указан Id пользователя"), null); }

  if (!options["giftid"] || !options["data"] || !options["date"] || !options["fromid"]
    || !options["fromvid"]) {
    return callback(new Error("Не указаны параметры подарка"), null);
  }

  var id = this.uuid.random();

  var fields = ["id", "userid", "giftid", "type", "data", "date", "title", "fromid", "fromvid"];
  var query = buildQuery.build(buildQuery.Q_INSERT, fields, C.T_USERGIFTS);

  var params = [];
  params.push(id);
  params.push(uid);
  params.push(options["giftid"]);
  params.push(options["type"]);
  params.push(options["data"]);
  params.push(options["date"]);
  params.push(options["title"]);
  params.push(options["fromid"]);
  params.push(options["fromvid"]);

  this.client.execute(query, params, { prepare: true },  function(err) {
    if (err) {  return callback(err); }

    var result = {};
    result["giftid"]  = options["giftid"];
    result["type"]    = options["type"];
    result["src"]     = options["data"];
    result["date"]    = options["date"];
    result["title"]   = options["title"];
    result["fromid"]  = options["fromid"];
    result["fromvid"] = options["fromvid"];
    result["gid"]     = id.toString();


    callback(null, result);
  });
};