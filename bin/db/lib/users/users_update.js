const dbCtrlr  = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF       = require('./../../../const_fields');

/*
 Изменяем данные пользователя: объек с данными
 - Проверка: поле ИД обязательные
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */

module.exports = function(options, callback) { options = options || {};
  
  const DBF = DB_CONST.USERS.fields;
  const DBN = DB_CONST.USERS.name;

  if (!options[PF.ID] || !options[PF.VID]) {
    return callback(new Error("Задан пустй Id пользователя"), null);
  }
  
  let fieldsArr     = [DBF.VID_varchar_i];
  let condFieldsArr = [DBF.ID_uuid_p];
  let condValuesArr = [1];
  
  let paramsArr = [];
  paramsArr.push(options[PF.VID]);
  
  if (PF.BDATE in options)         { fieldsArr.push(DBF.BDATE_timestamp);   paramsArr.push(options[PF.AGE]); }
  if (PF.COUNTRY in options)       { fieldsArr.push(DBF.COUNTRY_int);       paramsArr.push(options[PF.COUNTRY]); }
  if (PF.CITY in options)          { fieldsArr.push(DBF.CITY_int);          paramsArr.push(options[PF.CITY]); }
  if (PF.STATUS in options)        { fieldsArr.push(DBF.STATUS_varchar);    paramsArr.push(options[PF.STATUS]); }
  if (PF.MONEY in options)         { fieldsArr.push(DBF.MONEY_int);         paramsArr.push(options[PF.MONEY]); }
  if (PF.SEX in options)           { fieldsArr.push(DBF.SEX_int);           paramsArr.push(options[PF.SEX]); }
  if (PF.POINTS in options)        { fieldsArr.push(DBF.POINTS_int);        paramsArr.push(options[PF.POINTS]); }
  if (PF.ISMENU in options)        { fieldsArr.push(DBF.ISMENU_boolean);    paramsArr.push(options[PF.ISMENU]); }
  if (PF.GIFT1 in options)         { fieldsArr.push(DBF.GIFT1_uuid);        paramsArr.push(options[PF.GIFT1]); }
  if (PF.LEVEL in options)         { fieldsArr.push(DBF.LEVEL_int);         paramsArr.push(options[PF.LEVEL]); }
  if (PF.FREE_GIFTS in options)    { fieldsArr.push(DBF.FREE_GIFTS_int);    paramsArr.push(options[PF.FREE_GIFTS]); }
  if (PF.FREE_TRACKS in options)   { fieldsArr.push(DBF.FREE_TRACKS);       paramsArr.push(options[PF.FREE_TRACKS]); }
  if (PF.VIP in options)           { fieldsArr.push(DBF.VIP_boolean);       paramsArr.push(options[PF.VIP]); }
  
  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_UPDATE, fieldsArr, DBN, condFieldsArr, condValuesArr);
  
  paramsArr.push(options[PF.ID]);
  
  dbCtrlr.client.execute(query, paramsArr, {prepare: true }, (err) => {
    if (err) {
      return callback(err);
    }
    
    callback(null, options);
  });
};