var constants = require('./../../../constants');
var cdb = require('./../common/cassandra_db');
var PF  = require('./../../constants').PFIELDS;


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

  var fields = ["vid"];
  var constFields = ["id"];
  var constValues = [1];

  var params = [];
  params.push(options[PF.VID]);
  if (PF.AGE in options)           { fields.push("age");           params.push(options[PF.AGE]); }
  if (PF.COUNTRY in options)       { fields.push("country");       params.push(options[PF.COUNTRY]); }
  if (PF.CITY in options)          { fields.push("city");          params.push(options[PF.CITY]); }
  if (PF.STATUS in options)        { fields.push("status");        params.push(options[PF.STATUS]); }
  if (PF.MONEY in options)         { fields.push("money");         params.push(options[PF.MONEY]); }
  if (PF.SEX in options)           { fields.push("sex");           params.push(options[PF.SEX]); }
  if (PF.POINTS in options)        { fields.push("points");        params.push(options[PF.POINTS]); }
  if (PF.ISMENU in options)        { fields.push("ismenu");        params.push(options[PF.ISMENU]); }
  if (PF.GIFT1 in options)         { fields.push("gift1");         params.push(options[PF.GIFT1]); }
  if (PF.ISFRIENDS in options)     { fields.push("newfriends");    params.push(options[PF.ISFRIENDS]); }
  if (PF.ISGIFTS in options)       { fields.push("newgifts");      params.push(options[PF.ISGIFTS]); }
  if (PF.ISGUESTS in options)      { fields.push("newguests");     params.push(options[PF.ISGUESTS]); }
  if (PF.ISMESSAGES in options)    { fields.push("newmessages");   params.push(options[PF.ISMESSAGES]); }

  var query = cdb.qBuilder.build(cdb.qBuilder.Q_UPDATE, fields, constants.T_USERS, constFields, constValues);

  params.push(options[PF.ID]);

  cdb.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};