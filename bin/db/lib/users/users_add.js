var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF  = require('./../../constants').PFIELDS;

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

  var fields = ["id", "vid"];
  var params = [id, options[PF.VID]];
  if (options[PF.AGE])     { fields.push("age");     params.push(options[PF.AGE]); }
  if (options[PF.COUNTRY]) { fields.push("country"); params.push(options[PF.COUNTRY]); }
  if (options[PF.CITY])    { fields.push("city");    params.push(options[PF.CITY]); }
  if (options[PF.STATUS])  { fields.push("status");  params.push(options[PF.STATUS]); }
  if (options[PF.MONEY])   { fields.push("money");   params.push(options[PF.MONEY]); }
  if (options[PF.SEX])     { fields.push("sex");     params.push(options[PF.SEX]); }
  if (options[PF.POINTS])  { fields.push("points");  params.push(options[PF.POINTS]); }
  if (options[PF.ISMENU])  { fields.push("ismenu");  params.push(options[PF.ISMENU]); }
  if (options[PF.GIFT1])   { fields.push("gift1");   params.push(options[PF.GIFT1]); }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_INSERT, fields, constants.T_USERS);

  cdb.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options[PF.ID] = id;
    callback(null, options);
  });
};
