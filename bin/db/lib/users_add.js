var constants = require('../../constants');
var cdb = require('./../../cassandra_db');

/*
 Добавляем пользователя в БД: объект с данными пользователя из соц. сетей
 - Проверка (ВИД обязателен)
 - Генерируем внутренний ИД
 - Строим запрос
 - Выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options = options || {};
  if (!options["vid"]) { return callback(new Error("Не задан ИД пользователя ВКонтакте"), null); }

  var id = cdb.uuid.random();

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

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERS);

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options["id"] = id;
    callback(null, options);
  });
};
