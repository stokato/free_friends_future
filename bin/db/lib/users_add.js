var C = require('../constants');
var qBuilder = require('./build_query');
/*
 Добавляем пользователя в БД: объект с данными пользователя из соц. сетей
 - Проверка (ВИД обязателен)
 - Генерируем внутренний ИД
 - Строим запрос
 - Выполняем запрос
 - Возвращаем объект обратно
 */
module.exports = function(options, callback) { options = options || {};

  var f = C.IO.FIELDS;

  if (!options[f.vid]) { return callback(new Error("Не задан ИД пользователя ВКонтакте"), null); }

  var id = this.uuid.random();

  var fields = [f.id, f.vid];
  var params = [id, options[f.vid]];
  if (options[f.age])     { fields.push(f.age);     params.push(options[f.age]); }
  if (options[f.country]) { fields.push(f.country); params.push(options[f.country]); }
  if (options[f.city])    { fields.push(f.city);    params.push(options[f.city]); }
  if (options[f.status])  { fields.push(f.status);  params.push(options[f.status]); }
  if (options[f.money])   { fields.push(f.money);   params.push(options[f.money]); }
  if (options[f.sex])     { fields.push(f.sex);     params.push(options[f.sex]); }
  if (options[f.points])  { fields.push(f.points);  params.push(options[f.points]); }
  if (options[f.is_in_menu])  { fields.push(f.is_in_menu);  params.push(options[f.is_in_menu]); }

  var query = qBuilder.build(qBuilder.Q_INSERT, fields, C.T_USERS);

  this.client.execute(query, params, {prepare: true },  function(err) {
    if (err) {  return callback(err); }

    options[f.id] = id;
    callback(null, options);
  });
};
