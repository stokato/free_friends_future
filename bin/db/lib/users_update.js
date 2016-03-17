var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Изменяем данные пользователя: объек с данными
 - Проверка: поле ИД обязательные
 - Строим и выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options = options || {};
  var f = C.IO.FIELDS;

  if (!options[f.id] || !options[f.vid]) {
    return callback(new Error("Задан пустй Id пользователя"), null);
  }

  var fields = [f.vid];
  var params = [];
  params.push(options[f.vid]);
  if (options[f.age])     { fields.push(f.age);      params.push(options[f.age]); }
  if (options[f.country]) { fields.push(f.country);  params.push(options[f.country]); }
  if (options[f.city])    { fields.push(f.city);     params.push(options[f.city]); }
  if (options[f.status])  { fields.push(f.status);   params.push(options[f.status]); }
  if (options[f.money])   { fields.push(f.money);    params.push(options[f.money]); }
  if (options[f.sex])     { fields.push(f.sex);      params.push(options[f.sex]); }
  if (options[f.points])  { fields.push(f.points);   params.push(options[f.points]); }

  var query = qBuilder.build(qBuilder.Q_UPDATE, fields, C.T_USERS, [f.id], [1]);

  params.push(options[f.id]);

  this.client.execute(query, params, {prepare: true }, function(err) {
    if (err) {  return callback(err); }

    callback(null, options);
  });
};