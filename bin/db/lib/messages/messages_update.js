

const dbCtrlr   = require('./../common/cassandra_db');
const DB_CONST  = require('./../../constants');
const PF        = require('./../../../const_fields');

/*
 Изменить сообщение в БД: Свойства сообщения
 - Проверка (ИД обязателен)
 - Строим и выполняем запрос
 - Возвращаем объект сообщения
 */
module.exports = function(uid, options, callback) { options = options || {};
  
  const DBF = DB_CONST.USER_MESSAGES.fields;
  const DBN = DB_CONST.USER_MESSAGES.name;
  
  if (!options[PF.ID] || !uid || !options[PF.MESSAGEID]) {
    return callback(new Error("Задан пустй Id пользователя, его собеседника или сообщения"), null);
  }

  let fieldsArr = [DBF.ID_timeuuid_c];
  let condFieldsArr = [DBF.USERID_uuid_pci, DBF.COMPANIONID_uuid_pc2i, DBF.ID_timeuuid_c];
  let condValuesArr = [1, 1, 1];

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_SELECT, fieldsArr, DBN, condFieldsArr, condValuesArr);

  let paramsArr = [uid, options[PF.ID], options[PF.MESSAGEID]];

  // Получаем сообщение
  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    if(result.rows.length == 0) {
      return callback(new Error("Сообщения с таким Id нет в базе данных"), null);
    }

    let fieldsArr = [];
    if (options[PF.DATE])      { fieldsArr.push(DBF.DATE_timestamp);        paramsArr.push(options[PF.DATE]); }
    if (options[PF.VID])       { fieldsArr.push(DBF.COMPANIONVID_varchar);  paramsArr.push(options[PF.VID]); }
    if (options[PF.INCOMING])  { fieldsArr.push(DBF.INCOMING_boolean);      paramsArr.push(options[PF.INCOMING]); }
    if (options[PF.TEXT])      { fieldsArr.push(DBF.TEXT_text);             paramsArr.push(options[PF.TEXT]); }

    let condFieldsArr = [DBF.USERID_uuid_pci, DBF.COMPANIONID_uuid_pc2i, DBF.ID_timeuuid_c];
    let condValuesArr = [1, 1, 1];

    let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_UPDATE, fieldsArr, DBN, condFieldsArr, condValuesArr);

    // Сохраняем изменения
    dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
      if (err) {
        return callback(err);
      }

      callback(null, options);
    });
  });
};