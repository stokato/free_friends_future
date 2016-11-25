var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USERS.fields;
var PF = dbConst.PFIELDS;

/*
 Изменяем данные пользователя: объек с данными
 - Проверка: поле ИД обязательные
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options = options || {};

  if (!options[PF.ID] || !options[PF.VID]) {
    return callback(new Error("Задан пустй Id пользователя"), null);
  }

  var fields = [DBF.VID_varchar_i];
  var constFields = [DBF.ID_uuid_p];
  var constValues = [1];
  var dbName = dbConst.DB.USERS.name;

  var params = [];
  params.push(options[PF.VID]);
  if (PF.BDATE in options)          { fields.push(DBF.BDATE_timestamp);    params.push(options[PF.AGE]); }
  if (PF.COUNTRY in options)       { fields.push(DBF.COUNTRY_int);       params.push(options[PF.COUNTRY]); }
  if (PF.CITY in options)          { fields.push(DBF.CITY_int);          params.push(options[PF.CITY]); }
  if (PF.STATUS in options)        { fields.push(DBF.STATUS_varchar);    params.push(options[PF.STATUS]); }
  if (PF.MONEY in options)         { fields.push(DBF.MONEY_int);         params.push(options[PF.MONEY]); }
  if (PF.SEX in options)           { fields.push(DBF.SEX_int);           params.push(options[PF.SEX]); }
  if (PF.POINTS in options)        { fields.push(DBF.POINTS_int);        params.push(options[PF.POINTS]); }
  if (PF.ISMENU in options)        { fields.push(DBF.ISMENU);            params.push(options[PF.ISMENU]); }
  if (PF.GIFT1 in options)         { fields.push(DBF.GIFT1_uuid);        params.push(options[PF.GIFT1]); }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, dbName, constFields, constValues);

  params.push(options[PF.ID]);

  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};