const cdb     = require('./../common/cassandra_db');
const dbConst = require('./../../constants');

const DBF = dbConst.DB.USERS.fields;
const PF  = dbConst.PFIELDS;

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

  let fields = [DBF.VID_varchar_i];
  let constFields = [DBF.ID_uuid_p];
  let constValues = [1];
  let dbName = dbConst.DB.USERS.name;

  let params = [];
  params.push(options[PF.VID]);
  if (PF.BDATE in options)         { fields.push(DBF.BDATE_timestamp);   params.push(options[PF.AGE]); }
  if (PF.COUNTRY in options)       { fields.push(DBF.COUNTRY_int);       params.push(options[PF.COUNTRY]); }
  if (PF.CITY in options)          { fields.push(DBF.CITY_int);          params.push(options[PF.CITY]); }
  if (PF.STATUS in options)        { fields.push(DBF.STATUS_varchar);    params.push(options[PF.STATUS]); }
  if (PF.MONEY in options)         { fields.push(DBF.MONEY_int);         params.push(options[PF.MONEY]); }
  if (PF.SEX in options)           { fields.push(DBF.SEX_int);           params.push(options[PF.SEX]); }
  if (PF.POINTS in options)        { fields.push(DBF.POINTS_int);        params.push(options[PF.POINTS]); }
  if (PF.ISMENU in options)        { fields.push(DBF.ISMENU_boolean);    params.push(options[PF.ISMENU]); }
  if (PF.GIFT1 in options)         { fields.push(DBF.GIFT1_uuid);        params.push(options[PF.GIFT1]); }
  if (PF.LEVEL in options)         { fields.push(DBF.LEVEL_int);         params.push(options[PF.LEVEL]); }
  if (PF.FREE_GIFTS in options)    { fields.push(DBF.FREE_GIFTS_int);    params.push(options[PF.FREE_GIFTS]); }
  if (PF.FREE_TRACKS in options)   { fields.push(DBF.FREE_TRACKS);       params.push(options[PF.FREE_TRACKS]); }
  if (PF.VIP in options)           { fields.push(DBF.VIP_boolean);       params.push(options[PF.VIP]); }

  let query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, dbName, constFields, constValues);

  params.push(options[PF.ID]);

  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};