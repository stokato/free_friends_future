var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');

/*
 Изменить сообщение в БД: Свойства сообщения
 - Проверка (ИД обязателен)
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  if (!options["id"] || !uid || !options["companionid"]) {
    return callback(new Error("Задан пустй Id пользователя, его собеседника или сообщения"), null);
  }

  var constFields = ["userid", "companionid", "id"];
  var constValues = [1, 1, 1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, ["id"], constants.T_USERMESSAGES, constFields, constValues);

  var params = [uid, options["companionid"], options["id"]];

  // Получаем сообщение
  cdb.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(new Error("Сообщения с таким Id нет в базе данных"), null)}

    var fields = [];
    if (options["date"])          { fields.push("date");          params.push(options["date"]); }
    if (options["companionvid"])  { fields.push("companionvid");  params.push(options["companionvid"]); }
    if (options["incoming"])      { fields.push("incoming");      params.push(options["incoming"]); }
    if (options["text"])          { fields.push("text");          params.push(options["text"]); }
    if (options["opened"])        { fields.push("opened");        params.push(options["opened"]); }

    var constFields = ["userid", "companionid", "id"];
    var constValues = [1, 1, 1];

    var query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, constants.T_USERMESSAGES, constFields, constValues);

    // Сохраняем изменения
    cdb.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, options);
    });
  });
};