const dbCtrlr     = require('./../common/cassandra_db');
const DB_CONST = require('./../../constants');
const PF = require('./../../../const_fields');

const DBF = DB_CONST.USERS.fields;

/*
 Добавляем пользователя в БД: объект с данными пользователя из соц. сетей
 - Проверка (ВИД обязателен)
 - Генерируем внутренний ИД
 - Строим запрос
 - Выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options = options || {};
  if (!options[PF.VID]) { return callback(new Error("Не задан ИД пользователя ВКонтакте"), null); }

  let id = dbCtrlr.uuid.random();

  let fields = [DBF.ID_uuid_p, DBF.VID_varchar_i];
  let params = [id, options[PF.VID]];
  if (options[PF.BDATE])        { fields.push(DBF.BDATE_timestamp);  params.push(options[PF.BDATE]); }
  if (options[PF.COUNTRY])      { fields.push(DBF.COUNTRY_int);      params.push(options[PF.COUNTRY]); }
  if (options[PF.CITY])         { fields.push(DBF.CITY_int);         params.push(options[PF.CITY]); }
  if (options[PF.STATUS])       { fields.push(DBF.STATUS_varchar);   params.push(options[PF.STATUS]); }
  if (options[PF.MONEY])        { fields.push(DBF.MONEY_int);        params.push(options[PF.MONEY]); }
  if (options[PF.SEX])          { fields.push(DBF.SEX_int);          params.push(options[PF.SEX]); }
  if (options[PF.POINTS])       { fields.push(DBF.POINTS_int);       params.push(options[PF.POINTS]); }
  if (options[PF.ISMENU])       { fields.push(DBF.ISMENU);           params.push(options[PF.ISMENU]); }
  if (options[PF.GIFT1])        { fields.push(DBF.GIFT1_uuid);       params.push(options[PF.GIFT1]); }
  if (options[PF.LEVEL])        { fields.push(DBF.LEVEL_int);        params.push(options[PF.LEVEL]); }
  if (options[PF.FREE_GIFTS])   { fields.push(DBF.FREE_GIFTS_int);   params.push(options[PF.FREE_GIFTS]); }
  if (options[PF.FREE_TRACKS])  { fields.push(DBF.FREE_MUSIC_int);   params.push(options[PF.FREE_TRACKS]); }
  if (options[PF.VID])          { fields.push(DBF.VIP_boolean);      params.push(options[PF.VIP]); }

  let query = dbCtrlr.qBuilder.build(dbCtrlr.qBuilder.Q_INSERT, fields, DB_CONST.USERS.name);

  dbCtrlr.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options[PF.ID] = id.toString();
    
    callback(null, options);
  });
};
