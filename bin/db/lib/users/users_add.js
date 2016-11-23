var cdb = require('./../common/cassandra_db');
var dbConst = require('./../../constants');
var DBF = dbConst.DB.USERS.fields;
var PF = dbConst.PFIELDS;

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

  var id = cdb.uuid.random();

  var fields = [DBF.ID_uuid_p, DBF.VID_varchar_i];
  var params = [id, options[PF.VID]];
  if (options[PF.BDAY])    { fields.push(DBF.BDAY_timestamp);   params.push(options[PF.BDAY]); }
  if (options[PF.COUNTRY]) { fields.push(DBF.COUNTRY_int);      params.push(options[PF.COUNTRY]); }
  if (options[PF.CITY])    { fields.push(DBF.CITY_int);         params.push(options[PF.CITY]); }
  if (options[PF.STATUS])  { fields.push(DBF.STATUS_varchar);   params.push(options[PF.STATUS]); }
  if (options[PF.MONEY])   { fields.push(DBF.MONEY_int);        params.push(options[PF.MONEY]); }
  if (options[PF.SEX])     { fields.push(DBF.SEX_int);          params.push(options[PF.SEX]); }
  if (options[PF.POINTS])  { fields.push(DBF.POINTS_int);       params.push(options[PF.POINTS]); }
  if (options[PF.ISMENU])  { fields.push(DBF.ISMENU);           params.push(options[PF.ISMENU]); }
  if (options[PF.GIFT1])   { fields.push(DBF.GIFT1_uuid);       params.push(options[PF.GIFT1]); }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, dbConst.DB.USERS.name);

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options[PF.ID] = id;
    
    callback(null, options);
  });
};
