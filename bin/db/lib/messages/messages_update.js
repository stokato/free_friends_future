const dbCtrlr       = require('./../common/cassandra_db');
const DB_CONST   = require('./../../constants');
const PF = require('./../../../const_fields');

const DBF = DB_CONST.USER_MESSAGES.fields;

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

  let fields = [DBF.ID_timeuuid_c];
  let constFields = [DBF.USERID_uuid_pci, DBF.COMPANIONID_uuid_pc2i, DBF.ID_timeuuid_c];
  let constValues = [1, 1, 1];
  let dbName = DB_CONST.USER_MESSAGES.name;

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fields, dbName, constFields, constValues);

  let params = [uid, options[PF.ID], options[PF.MESSAGEID]];

  // Получаем сообщение
  dbCtrlr.client.execute(query, params, {prepare: true }, function(err, result) {
    if (err) { return callback(err, null); }

    if(result.rows.length == 0) { return callback(new Error("Сообщения с таким Id нет в базе данных"), null)}

    let fields = [];
    if (options[PF.DATE])      { fields.push(DBF.DATE_timestamp);        params.push(options[PF.DATE]); }
    if (options[PF.VID])       { fields.push(DBF.COMPANIONVID_varchar);  params.push(options[PF.VID]); }
    if (options[PF.INCOMING])  { fields.push(DBF.INCOMING_boolean);      params.push(options[PF.INCOMING]); }
    if (options[PF.TEXT])      { fields.push(DBF.TEXT_text);             params.push(options[PF.TEXT]); }

    let constFields = [DBF.USERID_uuid_pci, DBF.COMPANIONID_uuid_pc2i, DBF.ID_timeuuid_c];
    let constValues = [1, 1, 1];

    let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_UPDATE, fields, dbName, constFields, constValues);

    // Сохраняем изменения
    dbCtrlr.client.execute(query, params, {prepare: true }, function(err) {
      if (err) {  return callback(err); }

      callback(null, options);
    });
  });
};