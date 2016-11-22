var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF = require('./../../constants').PFIELDS;

/*
 Изменить сообщение в БД: Свойства сообщения
 - Проверка (ИД обязателен)
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  if (!options[PF.ID] || !uid || !options[PF.MESSAGEID]) {
    return callback(new Error("Задан пустй Id пользователя, его собеседника или сообщения"), null);
  }

  var constFields = ["userid", "companionid", "id"];
  var constValues = [1, 1, 1];

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_SELECT, ["id"], constants.T_USERMESSAGES, constFields, constValues);

  var params = [uid, options[PF.ID], options[PF.MESSAGEID]];

  // Получаем сообщение
  cdb.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(new Error("Сообщения с таким Id нет в базе данных"), null)}

    var fields = [];
    if (options[PF.DATE])          { fields.push("date");          params.push(options[PF.DATE]); }
    if (options[PF.VID])           { fields.push("companionvid");  params.push(options[PF.VID]); }
    if (options[PF.INCOMING])      { fields.push("incoming");      params.push(options[PF.INCOMING]); }
    if (options[PF.TEXT])          { fields.push("text");          params.push(options[PF.TEXT]); }
    if (options[PF.OPENED])        { fields.push("opened");        params.push(options[PF.OPENED]); }

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