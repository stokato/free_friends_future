var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Изменяем данные пользователя: объек с данными
 - Проверка: поле ИД обязательные
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options = options || {};

  if (!options["id"] || !options["vid"]) {
    return callback(new Error("Задан пустй Id пользователя"), null);
  }

  var fields = ["vid"];
  var constFields = ["id"];
  var constValues = [1];

  var params = [];
  params.push(options["vid"]);
  if ("age" in options)           { fields.push("age");           params.push(options["age"]); }
  if ("country" in options)       { fields.push("country");       params.push(options["country"]); }
  if ("city" in options)          { fields.push("city");          params.push(options["city"]); }
  if ("status" in options)        { fields.push("status");        params.push(options["status"]); }
  if ("money" in options)         { fields.push("money");         params.push(options["money"]); }
  if ("sex" in options)           { fields.push("sex");           params.push(options["sex"]); }
  if ("points" in options)        { fields.push("points");        params.push(options["points"]); }
  if ("ismenu" in options)        { fields.push("ismenu");        params.push(options["ismenu"]); }
  if ("gift1" in options)         { fields.push("gift1");         params.push(options["gift1"]); }
  if ("newfriends" in options)    { fields.push("newfriends");    params.push(options["newfriends"]); }
  if ("newgifts" in options)      { fields.push("newgifts");      params.push(options["newgifts"]); }
  if ("newguests" in options)     { fields.push("newguests");     params.push(options["newguests"]); }
  if ("newmessages" in options)   { fields.push("newmessages");   params.push(options["newmessages"]); }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, constants.T_USERS, constFields, constValues);

  params.push(options["id"]);

  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};