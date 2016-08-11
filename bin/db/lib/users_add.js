var C = require('../../constants');
var qBuilder = require('./build_query');
/*
 Добавляем пользователя в БД: объект с данными пользователя из соц. сетей
 - Проверка (ВИД обязателен)
 - Генерируем внутренний ИД
 - Строим запрос
 - Выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options = options || {};

  //var f = C.IO.FIELDS;

  if (!options["vid"]) { return callback(new Error("Не задан ИД пользователя ВКонтакте"), null); }

  var id = this.uuid.random();

  var fields = ["id", "vid"];
  var params = [id, options["vid"]];
  if (options["age"])     { fields.push("age");     params.push(options["age"]); }
  if (options["country"]) { fields.push("country"); params.push(options["country"]); }
  if (options["city"])    { fields.push("city");    params.push(options["city"]); }
  if (options["status"])  { fields.push("status");  params.push(options["status"]); }
  if (options["money"])   { fields.push("money");   params.push(options["money"]); }
  if (options["sex"])     { fields.push("sex");     params.push(options["sex"]); }
  if (options["points"])  { fields.push("points");  params.push(options["points"]); }
  if (options["ismenu"])  { fields.push("ismenu");  params.push(options["ismenu"]); }
  if (options["gift1"])   { fields.push("gift1");  params.push(options["gift1"]); }

  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERS);

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options["id"] = id;
    callback(null, options);
  });
};
